import * as nest from "@nestjs/common";
import { TypedRouteInterceptor } from "./internal/TypedRouteInterceptor";
import { get_route_arguments } from "./internal/get_route_arguments";

/**
 * Router decorator functions.
 * 
 * `TypedRoute` is an utility class containing router decorator functions.
 * 
 * Unlike the basic router decorator functions provided from the NestJS like 
 * {@link nest.Get} or {@link nest.Post}, router decorator functions in the `TypedRoute`
 * supports {@link ExceptionManager}, who can convert custom error classes to the regular
 * {@link nest.HttpException} class. 
 * 
 * Therefore, with the `TypedRoute` and {@link ExceptionManger}, you can manage your 
 * custom error classes much systematically. You can avoid 500 internal server error or
 * hard coding implementations about the custom error classes.
 * 
 * @author Jeongho Nam - https://github.com/samchon
 */
export namespace TypedRoute
{
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

    function Generator(method: "Get"|"Post"|"Put"|"Patch"|"Delete")
    {
        function create(path?: string | string[]): MethodDecorator;
        function create(...args: any[]): MethodDecorator
        {
            const [path, stringify] = get_route_arguments(...args);
            return nest.applyDecorators(
                nest[method](path),
                nest.UseInterceptors(new TypedRouteInterceptor(stringify))
            );
        }
        return create;
    }
}