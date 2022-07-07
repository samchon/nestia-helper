import express from "express";
import raw from "raw-body";
import { AesPkcs5, IEncryptionPassword } from "nestia-fetcher";
import {
    BadRequestException,
    createParamDecorator,
    ExecutionContext,
} from "@nestjs/common";
import { assertType, TypeGuardError } from "typescript-json";

import { ENCRYPTION_METADATA_KEY } from "./internal/EncryptedConstant";
import { Singleton } from "./internal/Singleton";
import { headers_to_object } from "./internal/headers_to_object";

/**
 * Encrypted body decorator.
 *
 * `EncryptedBody` is a decorator function getting JSON data from HTTP request who've
 * been encrypted by AES-128/256 algorithm. Also, `EncyrptedBody` validates the JSON
 * data type through
 * [`TSON.assertType()`](https://github.com/samchon/typescript-json#runtime-type-checkers)
 * function and throws `BadRequestException` error (status code: 400), if the JSON
 * data is not following the promised type.
 *
 * For reference, `EncryptedRoute` decrypts request body usnig those options.
 *
 *  - AES-128/256
 *  - CBC mode
 *  - PKCS #5 Padding
 *  - Base64 Encoding
 *
 * @return Parameter decorator
 * @author Jeongho Nam - https://github.com/samchon
 */
export function EncryptedBody<T>(assertion?: (input: T) => any) {
    return createParamDecorator(async function EncryptedBody(
        _unknown: any,
        ctx: ExecutionContext,
    ) {
        const request: express.Request = ctx.switchToHttp().getRequest();
        if (request.readable === false)
            throw new BadRequestException(
                "Request body is not the text/plain.",
            );

        const param:
            | IEncryptionPassword
            | IEncryptionPassword.Closure
            | undefined = Reflect.getMetadata(
            ENCRYPTION_METADATA_KEY,
            ctx.getClass(),
        );
        if (!param)
            throw new Error(
                "Error on EncryptedBody(): no encryption password is given.",
            );

        // GET BODY DATA
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

        // PARSE AND VALIDATE DATA
        const data: any = JSON.parse(
            disabled ? body : decrypt(body, password.key, password.iv),
        );
        if (assertion)
            try {
                assertion(data);
            } catch (exp) {
                if (exp instanceof TypeGuardError)
                    throw new BadRequestException({
                        path: exp.path,
                        reason: exp.message,
                        message:
                            "Request message is not following the promised type.",
                    });
                throw exp;
            }
        return data;
    })();
}
Object.assign(EncryptedBody, assertType);

/**
 * @internal
 */
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
