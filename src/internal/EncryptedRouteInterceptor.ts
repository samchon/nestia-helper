import * as nest from "@nestjs/common";
import { AesPkcs5, IEncryptionPassword } from "nestia-fetcher";
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ENCRYPTION_METADATA_KEY } from "./EncryptedConstant";
import { route_error } from "./route_error";

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

                const content: string = JSON.stringify(value);
                const password: IEncryptionPassword = typeof param === "function"
                    ? param(content, false)
                    : param;
                const disabled: boolean = password.disabled === undefined
                    ? false
                    : typeof password.disabled === "function" ? password.disabled(content, false) 
                    : password.disabled;

                if (disabled === true)
                    return content;

                return AesPkcs5.encrypt(content, password.key, password.iv);
            }),
            catchError(err => route_error(err)),
        );
    }
}