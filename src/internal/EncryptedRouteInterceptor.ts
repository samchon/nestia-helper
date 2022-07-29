import express from "express";
import { AesPkcs5, IEncryptionPassword } from "nestia-fetcher";
import { NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { Singleton } from "./Singleton";
import { map, catchError } from "rxjs/operators";

import { ENCRYPTION_METADATA_KEY } from "./EncryptedConstant";
import { headers_to_object } from "./headers_to_object";
import { route_error } from "./route_error";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";

/**
 * @internal
 */
export class EncryptedRouteInterceptor implements NestInterceptor {
    public constructor(
        private readonly method: string,
        private readonly stringify: (input: any) => string,
    ) {}

    public intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<any> {
        return next.handle().pipe(
            map((value) => {
                const param:
                    | IEncryptionPassword
                    | IEncryptionPassword.Closure
                    | undefined = Reflect.getMetadata(
                    ENCRYPTION_METADATA_KEY,
                    context.getClass(),
                );
                if (!param)
                    throw new Error(
                        `Error on EncryptedRoute.${this.method}(): no encryption password is given.`,
                    );

                const http: HttpArgumentsHost = context.switchToHttp();
                const headers: Singleton<Record<string, string>> =
                    new Singleton(() => {
                        const request: express.Request = http.getRequest();
                        return headers_to_object(request.headers);
                    });
                const body: string | undefined = this.stringify(value);
                const password: IEncryptionPassword =
                    typeof param === "function"
                        ? param({ headers: headers.get(), body }, false)
                        : param;
                const disabled: boolean =
                    password.disabled === undefined
                        ? false
                        : typeof password.disabled === "function"
                        ? password.disabled(
                              { headers: headers.get(), body },
                              false,
                          )
                        : password.disabled;

                const response: express.Response = http.getResponse();
                response.header(
                    "Content-Type",
                    disabled ? "application/json" : "text/plain",
                );

                if (disabled === true) return body;
                else if (body === undefined) return body;
                return AesPkcs5.encrypt(body, password.key, password.iv);
            }),
            catchError((err) => route_error(err)),
        );
    }
}
