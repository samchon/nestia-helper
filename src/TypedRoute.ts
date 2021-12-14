import * as nest from "@nestjs/common";
import { TypedRouteInterceptor } from "./internal/TypedRouteInterceptor";

/**
 * Router decorator functions.
 * 
 * `TypedRoute` is a utility class containing router decorator functions.
 * 
 * Unlike the basic router decorator functions provided from the NestJS like 
 * {@link nest.Get} or {@link nest.Post}, router decorator functions in the `TypedRoute`
 * supports {@link ExceptionManager}, who can convert custom error classes to the regular
 * {@link nest.HttpException} class. 
 * 
 * Therefore, with the `TypedRoute` and {@link ExceptionManger}, you can manage your 
 * custom error classes much systematically. You can avoid 500 internal server error or
 * hard coding implementations by the custom error classes.
 * 
 * @author Jeongho Nam - https://github.com/samchon
 */
export namespace TypedRoute
{
    /**
     * Router decorator function for the GET method.
     * 
     * @param path Path of the HTTP request
     * @returns Method decorator function
     */
    export function Get(path?: string): MethodDecorator
    {
        return nest.applyDecorators(
            nest.Get(path),
            nest.UseInterceptors(new TypedRouteInterceptor())
        );
    }

    /**
     * Router decorator function for the POST method.
     * 
     * @param path Path of the HTTP request
     * @returns Method decorator function
     */
    export function Post(path?: string)
    {
        return nest.applyDecorators(
            nest.Post(path),
            nest.UseInterceptors(new TypedRouteInterceptor())
        );
    }

    /**
     * Router decorator function for the PATH method.
     * 
     * @param path Path of the HTTP request
     * @returns Method decorator function
     */
    export function Patch(path?: string)
    {
        return nest.applyDecorators(
            nest.Patch(path),
            nest.UseInterceptors(new TypedRouteInterceptor())
        );
    }

    /**
     * Router decorator function for the PUT method.
     * 
     * @param path Path of the HTTP request
     * @returns Method decorator function
     */
    export function Put(path?: string)
    {
        return nest.applyDecorators(
            nest.Put(path),
            nest.UseInterceptors(new TypedRouteInterceptor())
        );
    }

    /**
     * Router decorator function for the DELETE method.
     * 
     * @param path Path of the HTTP request
     * @returns Method decorator function
     */
    export function Delete(path?: string)
    {
        return nest.applyDecorators(
            nest.Delete(path),
            nest.UseInterceptors(new TypedRouteInterceptor())
        );
    }
}