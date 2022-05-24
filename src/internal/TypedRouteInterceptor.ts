import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { route_error } from "./route_error";

/**
 * @internal
 */
export class TypedRouteInterceptor implements NestInterceptor
{
    public constructor
        (
            private readonly stringify: (input: any) => string
        )
    {
    }

    public intercept({}: ExecutionContext, next: CallHandler): Observable<any>
    {
        return next.handle().pipe
        (
            map(value => this.stringify(value)),
            catchError(err => route_error(err)),
        );
    }
}