import * as nest from "@nestjs/common";
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { AesPkcs5 } from "encrypted-fetcher";
import { Configuration } from "./Configuration";

export function EncryptedRoute(path: string)
{
    return nest.Controller(path);
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
        public intercept({}: nest.ExecutionContext, next: nest.CallHandler): Observable<any>
        {
            return next.handle().pipe(
                map(value => 
                {
                    let content: string = JSON.stringify(value);
                    content = AesPkcs5.encode(content, Configuration.KEY, Configuration.IV);

                    return content;
                }),
                catchError(err =>
                {
                    return throwError(err);
                }),
            );
        }
    }
}