import * as nest from "@nestjs/common";
import { EncryptedRouteInterceptor } from "./internal/EncryptedRouteInterceptor";

/**
 * Encrypted router decorator functions.
 * 
 * `EncryptedRout` is a utility class containing encrypted router decorator functions.
 * Unlike the basic router decorator functions provided from the NestJS like 
 * {@link nest.Get} or {@link nest.Post}, router decorator functions in the 
 * `EncryptedRoute` encrypts the response body with AES-128/256 algorithm. Also, they
 * support the {@link ExceptionManager} who can convert custom error classes to the 
 * regular {@link nest.HttpException} class.
 * 
 * Therefore, with the `EncryptedRoute` and {@link ExceptionManger}, you can manage your
 * custom error classes much systematically. You can avoid 500 internal server error or
 * hard coding implementations by the custom error classes. 
 * 
 * Furthermore, you can enhance security of your HTTP server by encrypting the response 
 * body through this `EncryptedRoute`. Also, don't be annoying about such AES-128/256 
 * encryption and decryption. If you build an SDK library of your HTTP server through 
 * the [nestia](https://github.com/samchon/nestia), such encryption and decryption would 
 * be automatically done in the SDK level.
 * 
 * @author Jeongho Nam - https://github.com/samchon
 */
export namespace EncryptedRoute
{
    /**
     * Encrypted router decorator function for the GET method.
     * 
     * @param path Path of the HTTP request
     * @returns Method decorator function
     */
    export function Get(path?: string): MethodDecorator
    {
        return nest.applyDecorators(
            nest.Get(path),
            nest.UseInterceptors(new EncryptedRouteInterceptor())
        );
    }

    /**
     * Encrypted router decorator function for the POST method.
     * 
     * @param path Path of the HTTP request
     * @returns Method decorator function
     */
    export function Post(path?: string): MethodDecorator
    {
        return nest.applyDecorators(
            nest.Post(path),
            nest.UseInterceptors(new EncryptedRouteInterceptor())
        );
    }

    /**
     * Encrypted router decorator function for the PATH method.
     * 
     * @param path Path of the HTTP request
     * @returns Method decorator function
     */
    export function Patch(path?: string): MethodDecorator
    {
        return nest.applyDecorators(
            nest.Patch(path),
            nest.UseInterceptors(new EncryptedRouteInterceptor())
        );
    }

    /**
     * Encrypted router decorator function for the PUT method.
     * 
     * @param path Path of the HTTP request
     * @returns Method decorator function
     */
    export function Put(path?: string): MethodDecorator
    {
        return nest.applyDecorators(
            nest.Put(path),
            nest.UseInterceptors(new EncryptedRouteInterceptor())
        );
    }

    /**
     * Encrypted router decorator function for the DELETE method.
     * 
     * @param path Path of the HTTP request
     * @returns Method decorator function
     */
    export function Delete(path?: string): MethodDecorator
    {
        return nest.applyDecorators(
            nest.Delete(path),
            nest.UseInterceptors(new EncryptedRouteInterceptor())
        );
    }
}