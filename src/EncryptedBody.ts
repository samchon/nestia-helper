import * as express from "express";
import * as nest from "@nestjs/common";
import raw from "raw-body";
import { HttpException } from "@nestjs/common";
import { AesPkcs5, IEncryptionPassword } from "nestia-fetcher";

import { ENCRYPTION_METADATA_KEY } from "./internal/EncryptedConstant";

const storage: WeakMap<(ctx: nest.ExecutionContext) => boolean, () => ParameterDecorator> = new WeakMap();
const default_closure = () => false as const;

/**
 * Encrypted body decorator.
 * 
 * `EncryptedBody` is a decorator function getting special JSON data from the HTTP request 
 * who've encrypted by the AES-125/256 algorithm. Therefore, `EncryptedBody` is suitable
 * for enhancing security by hiding request body data from the client.
 * 
 * Also you don't need to worry about the annyoing encryption and decryption. If you build
 * an SDK library of your HTTP server through the 
 * [nestia](https://github.com/samchon/nestia), such encryption would be automatically 
 * done in the SDK level.
 * 
 * @param disable Whether to disable the request body encryption or not. Default is `() => false`.
 * @return Parameter decorator
 * @author Jeongho Nam - https://github.com/samchon
 */
export function EncryptedBody
    (
        disable: (ctx: nest.ExecutionContext) => boolean = default_closure
    ): ParameterDecorator
{
    if (!disable)
        disable = default_closure;

    const oldbie = storage.get(disable);
    if (oldbie)
        return oldbie();

    const func: () => ParameterDecorator = nest.createParamDecorator
    (
        async function EncryptedBody({}: any, ctx: nest.ExecutionContext)
        {
            const request: express.Request = ctx.switchToHttp().getRequest();
            if (request.readable === false)
                throw new HttpException("Request body is not the text/plain.", 400);
    
            const param: IEncryptionPassword | IEncryptionPassword.Closure = Reflect.getMetadata
            (
                ENCRYPTION_METADATA_KEY, 
                ctx.getClass()
            );
            const content: string = (await raw(request, "utf8")).trim();
            const config: IEncryptionPassword = (param instanceof Function)
                ? param(content, false)
                : param;
    
            return JSON.parse
            (
                disable!(ctx) 
                    ? content 
                    : AesPkcs5.decrypt(content, config.key, config.iv)
            );
        }
    );

    storage.set(disable, func);
    return func();
}