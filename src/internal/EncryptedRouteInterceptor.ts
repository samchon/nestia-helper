import * as nest from "@nestjs/common";
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { AesPkcs5 } from "encrypted-fetcher";
import { IPassword } from "../IPassword";
import { route_caught_error } from "./route_caught_exception";

export class EncryptedRouteInterceptor implements nest.NestInterceptor
{
    public intercept(ctx: nest.ExecutionContext, next: nest.CallHandler): Observable<any>
    {
        const param: IPassword | IPassword.Closure = Reflect.getMetadata("encryption:password", ctx.getClass())
        return next.handle().pipe(
            map(value => 
            {
                const content: string = JSON.stringify(value);
                const password: IPassword = (param instanceof Function)
                    ? param(content, true)
                    : param;
                return AesPkcs5.encode(content, password.key, password.iv);
            }),
            catchError(err => route_caught_error(err)),
        );
    }
}