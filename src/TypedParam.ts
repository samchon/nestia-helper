import * as nest from "@nestjs/common";
import * as express from 'express';

/**
 * URL parameter decorator with type.
 * 
 * `TypedParam` is a decorator function getting specific typed parameter from the HTTP 
 * request URL. It's almost same with the {@link nest.Param}, but `TypedParam` can specify
 * the parameter type manually. Beside, the {@link nest.Param} always parses all of the 
 * parameters as string type.
 * 
 * ```typescript
 * \@TypedRoute.Get("shopping/sales/:section/:id/:paused")
 * public async pause
 *     (
 *         \@TypedParam("section", "string") section: string,
 *         \@TypedParam("id", "number") id: number,
 *         \@TypedParam("paused", "boolean") paused: boolean
 *     ): Promise<void>;
 * ```
 * 
 * @param name URL Parameter name
 * @param type Type of the URL parameter
 * @returns Parameter decorator
 * 
 * @author Jeongho Nam - https://github.com/samchon
 */
export function TypedParam(name: string, type: "boolean"|"number"|"string" = "string")
{
    return nest.createParamDecorator
    (
        function TypedParam({}: any, ctx: nest.ExecutionContext)
        {
            const request: express.Request = ctx.switchToHttp().getRequest();
            const ret: string = request.params[name];
            
            if (type === "boolean")
                return ret !== "false";
            else if (type === "number")
                return Number(ret)
            else
                return ret;
        }
    )(name);
}