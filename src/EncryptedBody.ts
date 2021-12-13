import * as express from "express";
import * as nest from "@nestjs/common";
import raw from "raw-body";

import { IPassword } from "./IPassword";
import { AesPkcs5 } from "encrypted-fetcher";
import { HttpException } from "@nestjs/common";

export const EncryptedBody: (() => ParameterDecorator) = nest.createParamDecorator
(
    async function EncryptedBody({}: any, context: nest.ExecutionContext)
    {
        const request: express.Request = context.switchToHttp().getRequest();
        if (request.readable === false)
            throw new HttpException("Request body is not the text/plain.", 500);

        const param: IPassword | IPassword.Closure = Reflect.getMetadata("encryption:password", context.getClass());
        const content: string = (await raw(request, "utf8")).trim();
        const config: IPassword = (param instanceof Function)
            ? param(content, false)
            : param;

        return JSON.parse(AesPkcs5.decode(content, config.key, config.iv));
    }
);