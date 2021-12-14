import { HttpException } from "@nestjs/common";
import { HttpError } from "nestia-fetcher";
import { TypeGuardError } from "typescript-is";

import { Creator } from "./typings/Creator";

/**
 * Exception manager for HTTP server.
 * 
 * `ExceptionManager` is an utility class 
 * 
 * @author Jeongho Nam - https://github.com/samchon
 */
export namespace ExceptionManager
{
    /**
     * 
     * 
     * @param creator Target error class
     * @param closure A closure function converting to the `HttpException` class
     */
    export function insert<T extends Error>
        (
            creator: Creator<T>, 
            closure: Closure<T>
        ): void
    {
        const index: number = tuples.findIndex(tuple => tuple[0] === creator);
        if (index !== -1)
            tuples.splice(index, 1);
        
        tuples.push([creator, closure]);
        tuples = tuples.sort(([x], [y]) => x.prototype instanceof y ? -1 : 1);
    }

    /**
     * 
     * 
     * @param creator Target error class
     * @returns Whether be erased or not
     */
    export function erase<T extends Error>
        (
            creator: Creator<T>
        ): boolean
    {
        const index: number = tuples.findIndex(tuple => tuple[0] === creator);
        if (index === -1)
            return false;

        tuples.splice(index, 1);
        return true;
    }

    /**
     * 
     */
    export interface Closure<T extends Error>
    {
        /**
         * 
         */
        (exception: T): HttpException;
    }

    /**
     * @internal
     */
    export let tuples: Array<[Creator<any>, Closure<any>]> = [];
}

ExceptionManager.insert(TypeGuardError, error => new HttpException({
    path: error.path,
    reason: error.reason,
    message: "Request message is not following the promised type."
}, 400));

ExceptionManager.insert(HttpError, error => new HttpException({
    path: error.path,
    message: error.message,
}, error.status));