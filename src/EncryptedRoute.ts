import * as nest from "@nestjs/common";
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { AesPkcs5 } from "encrypted-fetcher";
import { IPassword } from "./IPassword";
import { route_caught_error } from "./internal/route_caught_exception";

export namespace EncryptedRoute
{
    export function Get(path?: string): MethodDecorator
    {
        return nest.applyDecorators(
            nest.Get(path),
            nest.UseInterceptors(new Interceptor())
        );
    }

    export function Post(path?: string): MethodDecorator
    {
        return nest.applyDecorators(
            nest.Post(path),
            nest.UseInterceptors(new Interceptor())
        );
    }

    export function Patch(path?: string): MethodDecorator
    {
        return nest.applyDecorators(
            nest.Patch(path),
            nest.UseInterceptors(new Interceptor())
        );
    }

    export function Put(path?: string): MethodDecorator
    {
        return nest.applyDecorators(
            nest.Put(path),
            nest.UseInterceptors(new Interceptor())
        );
    }

    export function Delete(path?: string): MethodDecorator
    {
        return nest.applyDecorators(
            nest.Delete(path),
            nest.UseInterceptors(new Interceptor())
        );
    }

    class Interceptor implements nest.NestInterceptor
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
}