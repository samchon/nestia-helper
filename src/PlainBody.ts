import {
    createParamDecorator,
    ExecutionContext,
    BadRequestException,
} from "@nestjs/common";
import express from "express";
import raw from "raw-body";

/**
 * Plain body decorator.
 *
 * `PlainBody` is a decorator function getting full body text from the HTTP request.
 *
 * If you adjust the regular {@link nest.Body} decorator function to the body parameter,
 * you can't get the full body text because the {@link nest.Body} tries to convert the
 * body text to JSON object. Therefore, `nestia-helper` provides this `PlainBody`
 * decorator function to get the full body text.
 *
 * ```typescript
 * \@TypedRoute.Post("memo")
 * public store
 *     (
 *         \@PlainBody() body: string
 *     ): void;
 * ```
 *
 * @return Parameter decorator
 * @author Jeongho Nam - https://github.com/samchon
 */
export const PlainBody: () => ParameterDecorator = createParamDecorator(
    async function PlainBody(_data: any, context: ExecutionContext) {
        const request: express.Request = context.switchToHttp().getRequest();
        if (!request.readable) throw new BadRequestException("Invalid body");

        const body: string = (await raw(request)).toString("utf8").trim();
        return body;
    },
);
