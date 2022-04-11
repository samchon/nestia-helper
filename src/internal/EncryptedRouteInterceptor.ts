import express from "express";
import * as nest from "@nestjs/common";
import { AesPkcs5, IEncryptionPassword } from "nestia-fetcher";
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ENCRYPTION_METADATA_KEY } from "./EncryptedConstant";
import { Singleton } from "./Singleton";
import { headers_to_object } from "./headers_to_object";
import { route_error } from "./route_error";

/**
 * @internal
 */
export class EncryptedRouteInterceptor implements nest.NestInterceptor
{
    public constructor(public readonly method: string)
    {
    }

    public intercept(ctx: nest.ExecutionContext, next: nest.CallHandler): Observable<any>
    {
        return next.handle().pipe(
            map(value => 
            {
                const param: IEncryptionPassword | IEncryptionPassword.Closure | undefined = Reflect.getMetadata
                (
                    ENCRYPTION_METADATA_KEY, 
                    ctx.getClass()
                );
                if (!param)
                    throw new Error(`Error on EncryptedBody.${this.method}(): no encryption password is given.`);

                const headers: Singleton<Record<string, string>> = new Singleton(() =>
                {
                    const request: express.Request = ctx.switchToHttp().getRequest();
                    return headers_to_object(request.headers);
                });
                const body: string = JSON.stringify(value);
                const password: IEncryptionPassword = typeof param === "function"
                    ? param({ headers: headers.get(), body }, false)
                    : param;
                const disabled: boolean = password.disabled === undefined
                    ? false
                    : typeof password.disabled === "function" 
                        ? password.disabled({ headers: headers.get(), body }, false) 
                        : password.disabled;

                if (disabled === true)
                    return body;

                return AesPkcs5.encrypt(body, password.key, password.iv);
            }),
            catchError(err => route_error(err)),
        );
    }
}