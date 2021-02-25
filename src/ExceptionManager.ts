import { HttpException } from "@nestjs/common";
import { TypeGuardError } from "typescript-is";

import { Creator } from "./typings/Creator";

export namespace ExceptionManager
{
    export function insert<T>(creator: Creator<T>, closure: Closure<T>): void
    {
        if (dictionary.has(creator) === false)
            dictionary.set(creator, closure);
    }

    export function erase<T>(creator: Creator<T>): boolean
    {
        return dictionary.delete(creator);
    }

    export type Closure<T> = (exception: T) => HttpException;

    /**
     * @internal
     */
    export const dictionary: Map<Creator<any>, (exception: any) => HttpException> = new Map();
}

ExceptionManager.insert(TypeGuardError, error => new HttpException({
    path: error.path,
    reason: error.reason,
    message: "Request message is not following the promised type."
}, 400))