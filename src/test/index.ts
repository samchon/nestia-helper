import { NestFactory } from "@nestjs/core";
import { AesPkcs5, EncryptedFetcher } from "encrypted-fetcher";
import { Module } from "@nestjs/common";
import { EncryptedBody } from "../EncryptedBody";
import { EncryptedRoute } from "../EncryptedRoute";
import { IPassword } from "../IPassword";
import { TypedParam } from "../TypedParam";

const CONFIG: IPassword = {
    key: AesPkcs5.random(16),
    iv: AesPkcs5.random(16)
}

@EncryptedRoute("", CONFIG)
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
}

@Module({ controllers: [ TestController ] })
class TestModule
{
}

class TestFetcher extends EncryptedFetcher
{
    public constructor()
    {
        super("http://127.0.0.1:36999", CONFIG);
    }

    public index(): Promise<{ id: number, name: string }>
    {
        return this.fetch("GET", "/index.html");
    }

    public something<T extends object>(id: number, input: T): Promise<{ id: number, input: T }>
    {
        return this.fetch("POST", `/${id}`, input);
    }
}

async function main(): Promise<void>
{
    // OPEN SERVER
    const app = await NestFactory.create(TestModule);
    await app.listen(36999);

    // REQUESTS BY CLIENT
    const fetcher = new TestFetcher();
    const index = await fetcher.index();
    if (index.id !== 1 || index.name !== "Samchon")
        throw new Error("Bug on GET /index.html");

    const something = await fetcher.something(3, { text: "yaho" });
    if (something.id !== 3 || something.input.text !== "yaho")
        throw new Error("Bug on POST /something");

    // SUCCESS WITH CLOSING
    await app.close();
}
main();