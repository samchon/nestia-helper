import * as express from "express";
import * as nest from "@nestjs/common";
import raw from "raw-body";
import { AesPkcs5 } from "nestia-fetcher";
import { HttpException } from "@nestjs/common";

import { IEncryptionPassword } from "./IEncryptionPassword";

export const EncryptedBody: (() => ParameterDecorator) = nest.createParamDecorator
(
    async function EncryptedBody({}: any, context: nest.ExecutionContext)
    {
        const request: express.Request = context.switchToHttp().getRequest();
        if (request.readable === false)
            throw new HttpException("Request body is not the text/plain.", 500);

        const param: IEncryptionPassword | IEncryptionPassword.Closure = Reflect.getMetadata("encryption:password", context.getClass());
        const content: string = (await raw(request, "utf8")).trim();
        const config: IEncryptionPassword = (param instanceof Function)
            ? param(content, false)
            : param;

        return JSON.parse(AesPkcs5.decrypt(content, config.key, config.iv));
    }
);