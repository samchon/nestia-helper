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
    const functor = path === undefined ? args[0] : args[1];
    return [
        path,
        functor !== undefined
            ? typeof functor === "function"
                ? functor
                : JSON.stringify
            : JSON.stringify,
    ];
}
