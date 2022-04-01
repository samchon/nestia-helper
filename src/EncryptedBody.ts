import * as express from "express";
import * as nest from "@nestjs/common";
import raw from "raw-body";
import { HttpException } from "@nestjs/common";
import { AesPkcs5, IEncryptionPassword } from "nestia-fetcher";

import { ENCRYPTION_METADATA_KEY } from "./internal/EncryptedConstant";

/**
 * Encrypted body decorator.
 * 
 * `EncryptedBody` is a decorator function getting special JSON data from the HTTP request 
 * who've encrypted by the AES-125/256 algorithm. Therefore, `EncryptedBody` is suitable
 * for enhancing security by hiding request body data from the client.
 * 
 * Also you don't need to worry about the annyoing encryption and decryption. If you build
 * an SDK library of your HTTP server through the [nestia](https://github.com/samchon/nestia), 
 * such encryption would be automatically done in the SDK level.
 * 
 * > However, if you've configure the {@link IEncryptionPassword.disabled} to be `true`, 
 * > who've defined in the {@link EncryptedModule} or {@link EncryptedController}, you can 
 * > disable the encryption and decryption algorithm. Therefore, when the 
 * > {@link IEncryptionPassword.disable} becomes the `true`, request body would be 
 * > considered as a plain text instead.
 * 
 * @return Parameter decorator
 * @author Jeongho Nam - https://github.com/samchon
 */
export const EncryptedBody = nest.createParamDecorator
(
    async function EncryptedBody({}: any, ctx: nest.ExecutionContext)
    {
        const request: express.Request = ctx.switchToHttp().getRequest();
        if (request.readable === false)
            throw new HttpException("Request body is not the text/plain.", 400);

        const param: IEncryptionPassword | IEncryptionPassword.Closure | undefined = Reflect.getMetadata
        (
            ENCRYPTION_METADATA_KEY, 
            ctx.getClass()
        );
        if (!param)
            throw new Error("Error on EncryptedBody(): no encryption password is given.");

        const content: string = (await raw(request, "utf8")).trim();
        const password: IEncryptionPassword = typeof param === "function"
            ? param(content, false)
            : param;
        const disabled: boolean = password.disabled === undefined
            ? false
            : typeof password.disabled === "function" ? password.disabled(content, true) 
            : password.disabled;

        return JSON.parse
        (
            disabled
                ? content 
                : AesPkcs5.decrypt(content, password.key, password.iv)
        );
    }
);