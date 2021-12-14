import { Controller } from "@nestjs/common";
import { IEncryptionPassword } from "./IEncryptionPassword";

export function EncryptedController
    (
        path: string, 
        password: IEncryptionPassword | IEncryptionPassword.Closure
    ): ClassDecorator
{
    return function (target: any)
    {
        Reflect.defineMetadata("encryption:password", password, target);
        Controller(path)(target);
    };
}