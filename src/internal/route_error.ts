import { Observable, throwError } from "rxjs";
import { ExceptionManager } from "../ExceptionManager";

export function route_error(error: any): Observable<never>
{
    for (const tuple of ExceptionManager.dictionary)
        if (error instanceof tuple[0])
            return throwError(tuple[1](error));
    return throwError(error);
}