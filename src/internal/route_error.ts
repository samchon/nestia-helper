import { HttpException } from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { ExceptionManager } from "../ExceptionManager";

export function route_error(error: any): Observable<never>
{
    // HTTP-ERROR
    if (error instanceof HttpException)
        return throwError(error);

    // CUSTOM-REGISTERED ERROR
    for (const tuple of ExceptionManager.dictionary)
        if (error instanceof tuple[0])
            return throwError(tuple[1](error));
    
    // MAYBE INTERNAL ERROR
    return throwError(error);
}