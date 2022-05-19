import { JsonMemory } from "typescript-json/lib/storages/JsonMemory";

export function get_route_arguments
    (
        ...args: any[]
    ): [
        string|string[]|undefined, 
        (input: any) => string
    ]
{
    const path: string|string[]|undefined 
        = args[0] === undefined ? undefined
        : typeof args[0] === "string" ? args[0]
        : args[0] instanceof Array && ( 
            args[0][1] === undefined ||
            typeof args[0][1] !== "function"
        ) ? undefined
        : undefined;
    const tuple = path === undefined
        ? args[0]
        : args[1];
    return [
        path, 
        tuple !== undefined
            && typeof tuple[0] === "string"
            && typeof tuple[1] === "function"
            ? JsonMemory.stringify(tuple[0], tuple[1])
            : JSON.stringify
    ];
}