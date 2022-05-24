/**
 * @packageDocumentation
 * @module api.functional.system
 * @nestia Generated by Nestia - https://github.com/samchon/nestia 
 */
//================================================================
import { Fetcher, Primitive } from "nestia-fetcher";
import type { IConnection } from "nestia-fetcher";

import type { ISystem } from "./../../structures/ISystem";

/**
 * @controller SystemController.get()
 * @path GET /system
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export function get
    (
        connection: IConnection
    ): Promise<get.Output>
{
    return Fetcher.fetch
    (
        connection,
        get.ENCRYPTED,
        get.METHOD,
        get.path()
    );
}
export namespace get
{
    export type Output = Primitive<ISystem>;

    export const METHOD = "GET" as const;
    export const PATH: string = "/system";
    export const ENCRYPTED: Fetcher.IEncrypted = {
        request: false,
        response: true,
    };

    export function path(): string
    {
        return `/system`;
    }
}