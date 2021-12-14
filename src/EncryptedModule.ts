import * as fs from "fs";
import * as nest from "@nestjs/common";

import { IEncryptionPassword } from "nestia-fetcher/lib/IEncryptionPassword";

export function EncryptedModule
    (
        metadata: nest.ModuleMetadata,
        password: IEncryptionPassword | IEncryptionPassword.Closure
    ): ClassDecorator
{
    return function (target: any)
    {
        nest.Module(metadata)(target);
        if (metadata.controllers !== undefined)
            for (const controller of metadata.controllers)
                Reflect.defineMetadata("encryption:password", password, controller);
    }
}

export namespace EncryptedModule
{
    export async function dynamic
        (
            path: string, 
            config: IEncryptionPassword | IEncryptionPassword.Closure
        ): Promise<object>
    {
        // LOAD CONTROLLERS
        const metadata: nest.ModuleMetadata = {
            controllers: await controllers(path, config)
        };

        // RETURNS WITH DECORATING
        @EncryptedModule(metadata, config)
        class Module {}
        return Module;
    }

    export async function controllers
        (
            path: string, 
            password: IEncryptionPassword | IEncryptionPassword.Closure
        ): Promise<any[]>
    {
        const output: any[] = [];
        await iterate(output, path);

        for (const elem of output)
            Reflect.defineMetadata("encryption:password", password, elem);

        return output;
    }

    async function iterate(controllers: object[], path: string): Promise<void>
    {
        const directory: string[] = await fs.promises.readdir(path);
        for (const file of directory)
        {
            const current: string = `${path}/${file}`;
            const stats: fs.Stats = await fs.promises.lstat(current);

            if (stats.isDirectory() === true)
                await iterate(controllers, current);
            else if (file.substr(-3) === `.${EXTENSION}`)
            {
                const external: any = await import(current.substr(0, current.length - 3));
                for (const key in external)
                {
                    const instance: object = external[key];
                    if (Reflect.getMetadata("path", instance) !== undefined)
                        controllers.push(instance);
                }
            }
        }
    }

    const EXTENSION = __filename.substr(-2);
}