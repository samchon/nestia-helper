import { AesPkcs5 } from "encrypted-fetcher";

export namespace Configuration
{
    export let KEY: string = AesPkcs5.random(16);
    export let IV: string = AesPkcs5.random(16);
}