import { Request } from "express";

export type IController<Controller extends object> = OmitNever<IController.Driver<Controller>>;

export namespace IController
{
    export type Driver<Controller extends object> = 
    {
        [P in keyof Controller]: Controller[P] extends object
            ? Controller[P] extends Function
                ? Functional<Controller[P]>
                : never
            : never;
    };

    export type Functional<Method extends Function> = Method extends (...args: infer Params) => infer Ret
        ? Params extends any[]
            ? Ret extends Promise<infer T>
                ? (request: Request, ...args: Params) => T | Promise<T>
                : (request: Request, ...args: Params) => Ret | Promise<Ret>
            : unknown
        : unknown;
}

type OmitNever<T extends object> = Omit<T, SpecialFields<T, never>>;
type SpecialFields<Instance extends object, Target> =
{
    [P in keyof Instance]: Instance[P] extends Target ? P : never;
}[keyof Instance];