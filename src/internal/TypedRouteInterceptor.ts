import * as nest from "@nestjs/common";
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { route_error } from "./route_error";

/**
 * @internal
 */
export class TypedRouteInterceptor implements nest.NestInterceptor
{
    public constructor
        (
            private readonly stringify: (input: any) => string
        )
    {
    }

    public intercept({}: nest.ExecutionContext, next: nest.CallHandler): Observable<any>
    {
        return next.handle().pipe
        (
            map(value => this.stringify(value)),
            catchError(err => route_error(err)),
        );
    }
}