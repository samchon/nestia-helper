import * as nest from "@nestjs/common";
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { AesPkcs5 } from "encrypted-fetcher";
import { IPassword } from "./IPassword";

export function EncryptedRoute(path: string, config: IPassword): ClassDecorator;
export function EncryptedRoute(path: string, closure: IPassword.Closure): ClassDecorator;

export function EncryptedRoute(path: string, config: IPassword | IPassword.Closure): ClassDecorator
{
    return function (target: any)
    {
        Reflect.defineMetadata("encryption:config", config, target);
        nest.Controller(path)(target);
    };
}

export namespace EncryptedRoute
{
    export function Get(path?: string)
    {
        return nest.applyDecorators(
            nest.Get(path),
            nest.UseInterceptors(new Interceptor())
        );
    }

    export function Post(path?: string)
    {
        return nest.applyDecorators(
            nest.Post(path),
            nest.UseInterceptors(new Interceptor())
        );
    }

    export function Patch(path?: string)
    {
        return nest.applyDecorators(
            nest.Patch(path),
            nest.UseInterceptors(new Interceptor())
        );
    }

    export function Put(path?: string)
    {
        return nest.applyDecorators(
            nest.Put(path),
            nest.UseInterceptors(new Interceptor())
        );
    }

    export function Delete(path?: string)
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
            const param: IPassword | IPassword.Closure = Reflect.getMetadata("encryption:config", ctx.getClass())
            return next.handle().pipe(
                map(value => 
                {
                    const content: string = JSON.stringify(value);
                    const config: IPassword = (param instanceof Function)
                        ? param(content, true)
                        : param;
                    return AesPkcs5.encode(content, config.key, config.iv);
                }),
                catchError(err =>
                {
                    return throwError(err);
                }),
            );
        }
    }
}