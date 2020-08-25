import * as express from "express";
import * as nest from "@nestjs/common";
import raw from "raw-body";

import { AesPkcs5 } from "encrypted-fetcher";
import { HttpException } from "@nestjs/common";

import { Configuration } from "./Configuration";

export const EncryptedBody = nest.createParamDecorator(async ({}: any, ctx: nest.ExecutionContext) =>
{
    let request: express.Request = ctx.switchToHttp().getRequest();
    if (request.readable === false)
        throw new HttpException("Request body is not the text/plain.", 500);

    let content: string = (await raw(request, "utf8")).trim();
    content = AesPkcs5.decode(content, Configuration.KEY, Configuration.IV);
    return JSON.parse(content);
});