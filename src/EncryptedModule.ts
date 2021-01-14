import * as fs from "fs";
import * as nest from "@nestjs/common";

import { IPassword } from "encrypted-fetcher";

export function EncryptedModule
    (
        metadata: nest.ModuleMetadata,
        password: IPassword | IPassword.Closure
    ): ClassDecorator
{
    return function (target: any)
    {
        nest.Module(metadata)(target);
        if (metadata.controllers !== undefined)
            for (const controller of metadata.controllers)
                Reflect.defineMetadata("encryption:config", password, controller);
    }
}

export namespace EncryptedModule
{
    export async function dynamic
        (
            path: string, 
            config: IPassword | IPassword.Closure
        ): Promise<object>
    {
        // LOAD CONTROLLERS
        const controllers: any[] = [];
        const metadata: nest.ModuleMetadata = {
            controllers: controllers
        };
        await iterate(controllers, path);

        // RETURNS WITH DECORATING
        const ret: any = {};
        EncryptedModule(metadata, config)(ret);
        return ret;
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