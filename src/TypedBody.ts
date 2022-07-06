import express from "express";
import raw from "raw-body";
import {
    createParamDecorator,
    ExecutionContext,
    HttpException,
} from "@nestjs/common";
import { assertType, TypeGuardError } from "typescript-json";

export function TypedBody<T>(assertion?: (input: T) => any) {
    return createParamDecorator(async function TypedBody(
        _unknown: any,
        context: ExecutionContext,
    ) {
        const request: express.Request = context.switchToHttp().getRequest();
        if (request.headers["content-type"] !== "application/json") {
            throw new HttpException(
                "Request body is not the application/json.",
                400,
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
                    throw new HttpException(
                        {
                            path: exp.path,
                            reason: exp.message,
                            message:
                                "Request message is not following the promised type.",
                        },
                        400,
                    );
                throw exp;
            }
        return data;
    })();
}
Object.assign(TypedBody, assertType);
