import { HttpException } from "@nestjs/common";
import { TypeGuardError } from "typescript-is";

import { Creator } from "./typings/Creator";

export namespace ExceptionManager
{
    export function insert<T>(creator: Creator<T>, closure: Closure<T>): void
    {
        const index: number = tuples.findIndex(tuple => tuple[0] === creator);
        if (index !== -1)
            tuples.splice(index, 1);
        
        tuples.push([creator, closure]);
        tuples = tuples.sort(([x], [y]) => x.prototype instanceof y ? -1 : 1);
    }

    export function erase<T>(creator: Creator<T>): boolean
    {
        const index: number = tuples.findIndex(tuple => tuple[0] === creator);
        if (index === -1)
            return false;

        tuples.splice(index, 1);
        return true;
    }

    export type Closure<T> = (exception: T) => HttpException;

    /**
     * @internal
     */
    export let tuples: Array<[Creator<any>, Closure<any>]> = [];
}

ExceptionManager.insert(TypeGuardError, error => new HttpException({
    path: error.path,
    reason: error.reason,
    message: "Request message is not following the promised type."
}, 400))