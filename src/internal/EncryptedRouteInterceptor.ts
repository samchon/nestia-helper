import * as nest from "@nestjs/common";
import { AesPkcs5, IEncryptionPassword } from "nestia-fetcher";
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ENCRYPTION_METADATA_KEY } from "./EncryptedConstant";
import { route_error } from "./route_error";

export class EncryptedRouteInterceptor implements nest.NestInterceptor
{
    public constructor(public readonly disable?: (ctx: nest.ExecutionContext) => boolean)
    {
    }

    public intercept(ctx: nest.ExecutionContext, next: nest.CallHandler): Observable<any>
    {
        const param: IEncryptionPassword | IEncryptionPassword.Closure = Reflect.getMetadata
        (
            ENCRYPTION_METADATA_KEY, 
            ctx.getClass()
        );

        return next.handle().pipe(
            map(value => 
            {
                const content: string = JSON.stringify(value);
                if (this.disable && this.disable(ctx) === true)
                    return content;

                const password: IEncryptionPassword = (param instanceof Function)
                    ? param(content, true)
                    : param;
                return AesPkcs5.encrypt(content, password.key, password.iv);
            }),
            catchError(err => route_error(err)),
        );
    }
}