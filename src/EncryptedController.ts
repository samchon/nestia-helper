import { Controller } from "@nestjs/common";
import { IPassword } from "./IPassword";

export function EncryptedController(path: string, password: IPassword): ClassDecorator;
export function EncryptedController(path: string, closure: IPassword.Closure): ClassDecorator;

export function EncryptedController(path: string, password: IPassword | IPassword.Closure): ClassDecorator
{
    return function (target: any)
    {
        Reflect.defineMetadata("encryption:password", password, target);
        Controller(path)(target);
    };
}