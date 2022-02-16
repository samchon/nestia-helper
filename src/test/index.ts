import { NestFactory } from "@nestjs/core";
import { Controller } from "@nestjs/common";
import { Fetcher, IConnection, IEncryptionPassword } from "nestia-fetcher";

import { EncryptedBody } from "../EncryptedBody";
import { EncryptedRoute } from "../EncryptedRoute";
import { TypedParam } from "../TypedParam";
import { EncryptedModule } from "../EncryptedModule";
import { assertType } from "typescript-is";

const ENCRYPTION_PASSWORD: IEncryptionPassword = {
    key: "abcd".repeat(8),
    iv: "abcd".repeat(4)
}

@Controller()
class TestController
{
    @EncryptedRoute.Get("index.html")
    public async index(): Promise<object>
    {
        return {
            id: 1,
            name: "Samchon"
        };
    }

    @EncryptedRoute.Post(":id")
    public async something
        (
            @TypedParam("id", "number") id: number, 
            @EncryptedBody() input: object
        ): Promise<object>
    {
        return {
            id: id,
            input: input
        };
    }

    @EncryptedRoute.Put("")
    public async test
        (
            @EncryptedBody() input: { id: number, name: string }
        ): Promise<{ content: string }>
    {
        assertType<typeof input>(input);
        return { content: "YAHO" };
    }

    @EncryptedRoute.Get("uuid/:id")
    public uuid
        (
            @TypedParam("id", "uuid") id: string
        ): object
    {
        return { id };
    }
}

@EncryptedModule({ controllers: [ TestController ] }, ENCRYPTION_PASSWORD)
class TestModule
{
}

namespace TestFetcher
{
    const connection: IConnection = {
        host: "http://127.0.0.1:36999",
        encryption: ENCRYPTION_PASSWORD
    };

    export function index(): Promise<{ id: number, name: string }>
    {
        return Fetcher.fetch(connection, { response: true }, "GET", "/index.html");
    }

    export function something<T extends object>
        (
            id: number, 
            input: T
        ): Promise<{ id: number, input: T }>
    {
        return Fetcher.fetch<T, any>
        (
            connection, 
            { request: true, response: true }, 
            "POST", 
            `/${id}`, 
            input
        );
    }

    export function test(input: { id: number, name: string }): Promise<object>
    {
        return Fetcher.fetch
        (
            connection,
            { request: true, response: true }, 
            "PUT",
            `/${input.id}`,
            input
        );
    }

    export function uuid(id: string): Promise<object>
    {
        return Fetcher.fetch
        (
            connection,
            { request: true, response: true },
            "GET",
            `/uuid/${id}`
        );
    }
}

async function main(): Promise<void>
{
    // OPEN SERVER
    const app = await NestFactory.create(TestModule);
    await app.listen(36999);

    // REQUESTS BY CLIENT
    const index = await TestFetcher.index();
    if (index.id !== 1 || index.name !== "Samchon")
        throw new Error("Bug on GET /index.html");

    const something = await TestFetcher.something(3, { text: "yaho" });
    if (something.id !== 3 || something.input.text !== "yaho")
        throw new Error("Bug on POST /something");

    try
    {
        await TestFetcher.test({ id: 3, name: 4 } as any);
        throw new Error("Bug on PUT /test: type checker does not work.");
    }
    catch {}

    await TestFetcher.uuid("1dad5e14-9152-4633-aaa5-578e3f6a689a");
    try
    {
        await TestFetcher.uuid("NULL");
        throw new Error("Bug on GET /uuid/:id: uuid type checker is not working.");
    }
    catch {}

    // SUCCESS WITH CLOSING
    await app.close();
}
main();