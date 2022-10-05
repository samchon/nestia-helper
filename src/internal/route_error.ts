import express from "express";
import { HttpException } from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { ExceptionManager } from "../ExceptionManager";

/**
 * @internal
 */
export function route_error(
    request: express.Request,
    error: any,
): Observable<never> {
    error = (() => {
        // HTTP-ERROR
        if (error instanceof HttpException) return error;

        // CUSTOM-REGISTERED ERROR
        for (const [creator, closure] of ExceptionManager.tuples)
            if (error instanceof creator) return closure(error);

        // MAYBE INTERNAL ERROR
        return error;
    })();

    try {
        error.method = request.method;
        error.path = request.path;
    } catch {}

    setTimeout(() => {
        for (const listener of ExceptionManager.listeners) {
            try {
                const res: any | Promise<any> = listener(error);
                if (typeof res === "object" && typeof res.catch === "function")
                    res.catch(() => {});
            } catch {}
        }
    }, 0);
    return throwError(() => error);
}
