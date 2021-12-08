import { HttpException } from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { ExceptionManager } from "../ExceptionManager";

export function route_error(error: any): Observable<never>
{
    // HTTP-ERROR
    if (error instanceof HttpException)
        return throwError(error);

    // CUSTOM-REGISTERED ERROR
    for (const [creator, closure] of ExceptionManager.tuples)
        if (error instanceof creator)
            return throwError(closure(error));
    
    // MAYBE INTERNAL ERROR
    return throwError(error);
}