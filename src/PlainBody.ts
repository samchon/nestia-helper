import * as express from "express";
import raw from 'raw-body';
import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const PlainBody: (() => ParameterDecorator) = createParamDecorator
(
    async function PlainBody(_data: any, context: ExecutionContext)
    {
        const requeest: express.Request = context.switchToHttp().getRequest();
        if (!requeest.readable)
            throw new BadRequestException("Invalid body");

        const body: string = (await raw(requeest)).toString("utf8").trim();
        return body;
    }
);