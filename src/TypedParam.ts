import * as nest from "@nestjs/common";
import * as express from 'express';

export function TypedParam(name: string, type: "boolean"|"number"|"string" = "string")
{
    return nest.createParamDecorator
    (
        function TypedParam({}: any, ctx: nest.ExecutionContext)
        {
            let request: express.Request = ctx.switchToHttp().getRequest();
            let ret: string = request.params[name];
            
            if (type === "boolean")
                return ret !== "false";
            else if (type === "number")
                return Number(ret)
            else
                return ret;
        }
    )(name);
}