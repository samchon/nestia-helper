import {
    Get,
    Post,
    Patch,
    Put,
    Delete,
    UseInterceptors,
    applyDecorators,
} from "@nestjs/common";
import { stringify } from "typescript-json";

import { EncryptedRouteInterceptor } from "./internal/EncryptedRouteInterceptor";
import { get_route_arguments } from "./internal/get_route_arguments";

/**
 * Encrypted router decorator functions.
 *
 * `EncryptedRoute` is a module containing router decorator functions which encrypts
 * response body data through AES-128/250 encryption. Also, those decorator functions
 * can boost up JSON string conversion speed about 5x times faster, through
 * [`TSON.stringify()`](https://github.com/samchon/typescript-json#fastest-json-string-conversion).
 *
 * For reference, `EncryptedRoute` encrypts response body usnig those options.
 *
 *  - AES-128/256
 *  - CBC mode
 *  - PKCS #5 Padding
 *  - Base64 Encoding
 *
 * Also, router functions in `EncryptedRoute` can convert custom error classes to the
 * regular {@link nest.HttpException} class automatically, through
 * {@link ExceptionManager}.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export namespace EncryptedRoute {
    /**
     * Encrypted router decorator function for the GET method.
     *
     * @param paths Path(s) of the HTTP request
     * @returns Method decorator
     */
    export const Get = Generator("Get");

    /**
     * Encrypted router decorator function for the GET method.
     *
     * @param paths Path(s) of the HTTP request
     * @returns Method decorator
     */
    export const Post = Generator("Post");

    /**
     * Encrypted router decorator function for the PATCH method.
     *
     * @param path Path of the HTTP request
     * @returns Method decorator
     */
    export const Patch = Generator("Patch");

    /**
     * Encrypted router decorator function for the PUT method.
     *
     * @param path Path of the HTTP request
     * @returns Method decorator
     */
    export const Put = Generator("Put");

    /**
     * Encrypted router decorator function for the DELETE method.
     *
     * @param path Path of the HTTP request
     * @returns Method decorator
     */
    export const Delete = Generator("Delete");

    function Generator(method: "Get" | "Post" | "Put" | "Patch" | "Delete") {
        function route(path?: string | string[]): MethodDecorator;
        function route(stringify?: (input: any) => string): MethodDecorator;
        function route(
            path: string | string[],
            stringify: (input: any) => string,
        ): MethodDecorator;

        function route(...args: any[]): MethodDecorator {
            const [path, stringify] = get_route_arguments(...args);
            return applyDecorators(
                ROUTERS[method](path),
                UseInterceptors(
                    new EncryptedRouteInterceptor(method, stringify),
                ),
            );
        }
        return route;
    }
}

const ROUTERS = {
    Get,
    Post,
    Put,
    Patch,
    Delete,
};
Object.assign(EncryptedRoute.Get, stringify);
Object.assign(EncryptedRoute.Delete, stringify);
Object.assign(EncryptedRoute.Post, stringify);
Object.assign(EncryptedRoute.Put, stringify);
Object.assign(EncryptedRoute.Patch, stringify);
