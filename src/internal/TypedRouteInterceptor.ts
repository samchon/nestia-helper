import express from "express";
import { Observable } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";

import { route_error } from "./route_error";

/**
 * @internal
 */
export class TypedRouteInterceptor implements NestInterceptor {
    public constructor(private readonly stringify: (input: any) => string) {}

    public intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<any> {
        const http: HttpArgumentsHost = context.switchToHttp();
        const response: express.Response = http.getResponse();
        response.header("Content-Type", "application/json");

        return next.handle().pipe(
            map((value) => this.stringify(value)),
            catchError((err) => route_error(http.getRequest(), err)),
        );
    }
}
