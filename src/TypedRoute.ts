import * as nest from "@nestjs/common";
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { route_caught_error } from "./internal/route_caught_exception";

export namespace TypedRoute
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
            return next.handle().pipe
            (
                map(value => value),
                catchError(err => route_caught_error(err)),
            );
        }
    }
}