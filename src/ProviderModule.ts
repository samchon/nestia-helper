import fs from "fs";
import { Module } from "@nestjs/common";

const EXTENSION = __filename.substr(-2);

async function iterate(providers: object[], path: string): Promise<void>
{
    let fileList: string[] = await fs.promises.readdir(path);
    for (let file of fileList)
    {
        let current: string = `${path}/${file}`;
        let stats: fs.Stats = await fs.promises.lstat(current);

        if (stats.isDirectory() === true)
            await iterate(providers, current);
        else if (file.substr(-3) === `.${EXTENSION}`)
        {
            let external: any = await import(current.substr(0, current.length - 3));
            for (let key in external)
            {
                let instance: object = external[key];
                if (Reflect.getMetadata("path", instance) !== undefined)
                    providers.push(instance);
            }
        }
    }
}

/**
 * Automatic provider module importer.
 * 
 * @author Jeongho Nam - https://github.com/samchon
 */
export async function ProviderModule(): Promise<object>
{
    let providers: any[] = [];
    await iterate(providers, __dirname);

    @Module({ controllers: providers })
    class Provider {}
    return Provider;
}