import { HttpException } from "@nestjs/common";
import { TypeGuardError } from "typescript-is";
import { Observable, throwError } from "rxjs";

export function route_caught_error(error: any): Observable<never>
{
    if (error instanceof TypeGuardError)
    {
        let detail: Record<string, any> = {
            path: error.path,
            reason: error.reason,
            message: "Request message is not following the promised type."
        };
        return throwError(new HttpException(detail, 400));
    }
    else
        return throwError(error);
}