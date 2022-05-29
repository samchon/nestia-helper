import { StringifyFactory } from "typescript-json/lib/factories/StringifyFactory";

export function get_route_arguments(
    ...args: any[]
): [string | string[] | undefined, (input: any) => string] {
    const path: string | string[] | undefined =
        args[0] === undefined
            ? undefined
            : typeof args[0] === "string"
            ? args[0]
            : args[0] instanceof Array &&
              (args[0][1] === undefined || typeof args[0][1] !== "function")
            ? undefined
            : undefined;
    const tuple = path === undefined ? args[0] : args[1];
    return [
        path,
        tuple !== undefined
            ? typeof tuple === "function"
                ? tuple
                : typeof tuple === "object"
                ? StringifyFactory.generate(tuple)
                : JSON.stringify
            : JSON.stringify,
    ];
}
