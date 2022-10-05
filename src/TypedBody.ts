import type express from "express";
import raw from "raw-body";
import {
    BadRequestException,
    createParamDecorator,
    ExecutionContext,
} from "@nestjs/common";
import { assertType, TypeGuardError } from "typescript-json";

/**
 * Safe body decorator.
 *
 * `TypedBody` is a decorator function getting JSON data from HTTP request. Also,
 * it validates the JSON data type through
 * [`TSON.assertType()`](https://github.com/samchon/typescript-json#runtime-type-checkers)
 * function and throws `BadRequestException` error (status code: 400), if the JSON
 * data is not following the promised type.
 *
 * @param assertion Custom assertion function. Default is `TSON.assertType()`
 * @author Jeongho Nam - https://github.com/samchon
 */
export function TypedBody<T>(assertion?: (input: T) => any) {
    return createParamDecorator(async function TypedBody(
        _unknown: any,
        context: ExecutionContext,
    ) {
        const request: express.Request = context.switchToHttp().getRequest();
        if (request.headers["content-type"] !== "application/json") {
            throw new BadRequestException(
                "Request body is not the application/json.",
            );
        }
        const data: any = request.body
            ? request.body
            : JSON.parse((await raw(request, "utf8")).trim());

        if (assertion)
            try {
                assertion(data);
            } catch (exp) {
                if (exp instanceof TypeGuardError)
                    throw new BadRequestException({
                        path: exp.path,
                        reason: exp.message,
                        message:
                            "Request message is not following the promised type.",
                    });
                throw exp;
            }
        return data;
    })();
}
Object.assign(TypedBody, assertType);
