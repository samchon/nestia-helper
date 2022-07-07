import {
    Get,
    Post,
    Patch,
    Put,
    Delete,
    UseInterceptors,
    applyDecorators,
} from "@nestjs/common";

import { TypedRouteInterceptor } from "./internal/TypedRouteInterceptor";
import { get_route_arguments } from "./internal/get_route_arguments";
import { stringify } from "typescript-json";

/**
 * Safe router decorator functions.
 *
 * `TypedRoute` is a module containing router decorator functions which can boost up
 * JSON string conversion speed about 5x times faster, through
 * [`TSON.stringify()`](https://github.com/samchon/typescript-json#fastest-json-string-conversion).
 *
 * Also, router functions in `TypedRoute` can convert custom error classes to the
 * regular {@link nest.HttpException} class automatically, through
 * {@link ExceptionManager}.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export namespace TypedRoute {
    /**
     * Router decorator function for the GET method.
     *
     * @param path Path of the HTTP request
     * @returns Method decorator
     */
    export const Get = Generator("Get");

    /**
     * Router decorator function for the POST method.
     *
     * @param path Path of the HTTP request
     * @returns Method decorator
     */
    export const Post = Generator("Post");

    /**
     * Router decorator function for the PATH method.
     *
     * @param path Path of the HTTP request
     * @returns Method decorator
     */
    export const Patch = Generator("Patch");

    /**
     * Router decorator function for the PUT method.
     *
     * @param path Path of the HTTP request
     * @returns Method decorator
     */
    export const Put = Generator("Put");

    /**
     * Router decorator function for the DELETE method.
     *
     * @param path Path of the HTTP request
     * @returns Method decorator
     */
    export const Delete = Generator("Delete");

    /**
     * @internal
     */
    function Generator(method: "Get" | "Post" | "Put" | "Patch" | "Delete") {
        function route(path?: string | string[]): MethodDecorator;
        function route(stringify?: (input: any) => string): MethodDecorator;
        function route(
            path: string | string[],
            stringify?: (input: any) => string,
        ): MethodDecorator;

        function route(...args: any[]): MethodDecorator {
            const [path, stringify] = get_route_arguments(...args);
            return applyDecorators(
                ROUTERS[method](path),
                UseInterceptors(new TypedRouteInterceptor(stringify)),
            );
        }
        return route;
    }
}

/**
 * @internal
 */
const ROUTERS = {
    Get,
    Post,
    Patch,
    Put,
    Delete,
};
Object.assign(TypedRoute.Get, stringify);
Object.assign(TypedRoute.Delete, stringify);
Object.assign(TypedRoute.Post, stringify);
Object.assign(TypedRoute.Put, stringify);
Object.assign(TypedRoute.Patch, stringify);
