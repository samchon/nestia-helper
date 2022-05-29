import express from "express";
import raw from "raw-body";
import { AesPkcs5, IEncryptionPassword } from "nestia-fetcher";
import {
    BadRequestException,
    createParamDecorator,
    ExecutionContext,
    HttpException,
} from "@nestjs/common";

import { ENCRYPTION_METADATA_KEY } from "./internal/EncryptedConstant";
import { Singleton } from "./internal/Singleton";
import { headers_to_object } from "./internal/headers_to_object";

/**
 * Encrypted body decorator.
 *
 * `EncryptedBody` is a decoratord function getting special JSON data from the HTTP request
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
export const EncryptedBody = createParamDecorator(async function EncryptedBody(
    {}: any,
    ctx: ExecutionContext,
) {
    const request: express.Request = ctx.switchToHttp().getRequest();
    if (request.readable === false)
        throw new HttpException("Request body is not the text/plain.", 400);

    const param: IEncryptionPassword | IEncryptionPassword.Closure | undefined =
        Reflect.getMetadata(ENCRYPTION_METADATA_KEY, ctx.getClass());
    if (!param)
        throw new Error(
            "Error on EncryptedBody(): no encryption password is given.",
        );

    const headers: Singleton<Record<string, string>> = new Singleton(() =>
        headers_to_object(request.headers),
    );
    const body: string = (await raw(request, "utf8")).trim();
    const password: IEncryptionPassword =
        typeof param === "function"
            ? param({ headers: headers.get(), body }, false)
            : param;
    const disabled: boolean =
        password.disabled === undefined
            ? false
            : typeof password.disabled === "function"
            ? password.disabled({ headers: headers.get(), body }, true)
            : password.disabled;

    return JSON.parse(
        disabled ? body : decrypt(body, password.key, password.iv),
    );
});

function decrypt(body: string, key: string, iv: string): string {
    try {
        return AesPkcs5.decrypt(body, key, iv);
    } catch (exp) {
        if (exp instanceof Error)
            throw new BadRequestException(
                "Failed to decrypt the request body. Check your body content or encryption password.",
            );
        else throw exp;
    }
}
