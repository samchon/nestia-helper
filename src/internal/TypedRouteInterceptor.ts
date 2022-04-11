import * as nest from "@nestjs/common";
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { route_error } from "./route_error";

/**
 * @internal
 */
export class TypedRouteInterceptor implements nest.NestInterceptor
{
    public intercept({}: nest.ExecutionContext, next: nest.CallHandler): Observable<any>
    {
        return next.handle().pipe
        (
            map(value => value),
            catchError(err => route_error(err)),
        );
    }
}