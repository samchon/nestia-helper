# Nestia Helper
```bash
npm install --save nestia-helper
```

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/nestia-helper/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/nestia-helper.svg)](https://www.npmjs.com/package/nestia-helper)
[![Downloads](https://img.shields.io/npm/dm/nestia-helper.svg)](https://www.npmjs.com/package/nestia-helper)
[![Build Status](https://github.com/samchon/nestia-helper/workflows/build/badge.svg)](https://github.com/samchon/nestia-helper/actions?query=workflow%3Abuild)

Helper library of the `NestJS` with [nestia](https://github.com/samchon/nestia).

`nestia-helper` is a type of helper library for `Nestia` by enhancing decorator functions. Also, all of the decorator functions provided by this `nestia-helper` are all fully compatible with the [nestia](https://github.com/samchon/nestia), who can generate SDK library by analyzing NestJS controller classes in the compilation level.

Of course, this `nestia-helper` is not essential for utilizing the `NestJS` and [nestia](https://github.com/samchon/nestia). You can generate SDK library of your NestJS developed backend server without this `nestia-helper`. However, as decorator functions of this `nestia-helper` is enough strong, I recommend you to adapt this `nestia-helper` when using `NestJS` and [nestia](https://github.com/samchon/nestia).




## Features
### EncryptedRoute
Encrypted router decorator functions.

`EncryptedRoute` is an utility class containing encrypted router decorator functions. Unlike the basic router decorator functions provided from the `NestJS` like `nest.Get()` or `nest.Post()`, router decorator functions in the `EncryptedRoute` encrypts the response body with AES-128/256 algorithm. Also, they support the [ExceptionManager](#exception-manager) who can convert custom error classes to the regular `nest.HttpException` class.

Therefore, with the `EncryptedRoute` and [ExceptionManager](#exception-manager), you can manage your custom error classes much systematically. You can avoid 500 internal server error or hard coding implementations about the custom error classes.

Furthermore, you can enhance security of your HTTP server by encrypting the response body through this `EncryptedRoute`. Also, don't be annoying about such AES-128/256 encryption and decryption. If you build an SDK library of your HTTP server through the [nestia](https://github.com/samchon/nestia), such encryption and decryption would be automatically done in the SDK level.

```typescript
@nest.Controller("bbs/articles")
export class BbsArticlesController
{
    @helper.EncryptedRoute.Get(":id")
    public async at
        (
            @nest.Param("id") id: string
        ): Promise<IBbsArticle>;
}
```

### EncryptedBody
Encrypted body decorator.

`EncryptedBody` is a decorator function getting special JSON data from the HTTP request who've encrypted by the AES-125/256 algorithm. Therefore, `EncryptedBody` is suitable for enhancing security by hiding request body data from the client.

Also you don't need to worry about the annyoing encryption and decryption. If you build an SDK library of your HTTP server through the [nestia](https://github.com/samchon/nestia), such encryption would be automatically done in the SDK level.

```typescript
@nest.Controller("bbs/articles")
export class BbsArticlesController
{
    @helper.EncryptedRoute.Post()
    public async store
        (
            @helper.EncryptedBody() input: IBbsArticle.IStore
        ): Promise<IBbsArticle>;

    @helper.EncryptedRoute.Put(":id")
    public async update
        (
            @nest.Param("id") id: string,
            @helper.EncryptedBody() input: IBbsArticle.IUpdate
        ): Promise<IBbsArticle.IContent>;
}
```

### EncryptedController
Encrypted controller.

`EncryptedController` is an extension of the `nest.Controller` class decorator function who configures encryption password of the AES-128/256 algorithm. The encryption algorithm and password would be used by [EncryptedRoute](#encryptedroute) and [EncryptedBody](#encryptedbody) to encrypt the request and response body of the HTTP protocol.

By the way, you can configure the encryption password in the global level by using [EncryptedModule](#encryptedmodule) instead of the `nest.Module` in the module level. In that case, you don't need to use this `EncryptedController` more. Just use the `nest.Controller` without duplicated encryption password definitions.

Of course, if you want to use different encryption password from the [EncryptedModule](#encryptedmodule), this `EncryptedController` would be useful again. Therefore, I recommend to use this `EncryptedController` decorator function only when you must configure different encryption password from the [EncryptedModule](#encryptedmodule) .

```typescript
@helper.EncryptedController("payments/webooks", {
    key: "SqwHmmXm1fZteI3URPtoyBWFJDMQ7FBQ",
    iv: "9eSfjygAClnE1JJs"
})
export class PaymentWebhooksController
{
    @helper.TypedRoute.Post()
    public async webhook
        (
            @helper.EncryptedBody() input: IPaymentWebhook
        ): Promise<void>;
}
```

### EncryptedModule
Encrypted module.

`EncryptedModule` is an extension of the `nest.Module` class decorator function who configures encryption password of the AES-128/256 algorithm. The encryption algorithm and password would be used by [EncryptedRoute](#encryptedroute) and [EncryptedBody](#encryptedbody) to encrypt the request and response bod of the HTTP protocol.

By using this `EncryptedModule` decorator function, all of the controllers configured in the metadata would be automatically changed to the [EncryptedController](#encryptedcontroller) with the password. If there're some original [EncryptedController](#encryptedcontroller) decorated classes in the metadata, their encryption password would be kept.

Therefore, if you're planning to place original [EncryptedController](#encryptedcontroller) decorated classes in the metadata, I hope them to have different encryption password from the module level. If not, I recommend you use the `nest.Controller` decorator function instead.

In addition, the `EncryptedModule` supports a convenient dynamic controller importing function, `EncryptedModule.dynamic`. If you use the function with directory path of the controller classes, it imports and configures the controller classes into the `nest.Module`, automatically.

```typescript
import helper from "nestia-helper";
import { NestFactory } from "@nestjs/core";

export class Backend
{
    private application_: nest.INestApplication | null;

    public async open(port: number): Promise<void>
    {
        this.application_ = await NestFactory.create
        (
            await helper.EncryptedModule.dynamic
            (
                __dirname + "/controllers",
                {
                    key: "pJXhbHlYfzkC1CBK8R67faaBgJWB9Myu",
                    iv: "IXJBt4MflFxvxKkn"
                }
            );
        );
        await this.application_.open(port);
    }
}
```

### ExceptionManager
Exception manager for HTTP server.

`ExceptionManager` is an utility class who can insert or erase custom error class with its convertion method to a regular `nest.HttpException` instance.

If you define an API function through [TypedRoute](#typedroute) or [EncryptedRoute](#encryptedroute)
instead of the basic router decorator functions like `nest.Get` or `nest.Post` and the API function throws a custom error whose class has been inserted in this EntityManager, the error would be automatically converted to the regular `nest.HttpException` instance by the `ExceptionManager.Closure` function.

Therefore, with this `ExceptionManager` and [TypedRoute](#typedroute) or [EncryptedRoute](#encryptedroute), you can manage your custom error classes much systemtically. You can avoid 500 internal server error or hard coding implementation about the custom error classes.

Below error classes are defaultly configured in this `ExceptionManager`

  - `typescript-is.TypeGuardError`
  - `nestia-fetcher.HttpError`

```typescript
import helper from "nestia-helper";
import * as nest from "@nestjs/common";
import * as orm from "typeorm";

//  ERROR FROM THE DATABASE
helper.ExceptionManager.insert(orm.QueryFailedError, exp => 
{
    if (exp.message.indexOf("ER_DUP_ENTRY: ") !== -1)
        return new nest.ConflictException("Blocked by unique constraint.");
    else if (exp.message.indexOf("ER_NO_REFERENCED_ROW_2") !== -1)
        return new nest.NotFoundException("Blocked by foreign constraint.");
    else
        return new nest.InternalServerErrorException(exp.message);
});
```

### TypedRoute
Router decorator functions.

`TypedRoute` is an utility class containing router decorator functions.

Unlike the basic router decorator functions provided from the `NestJS` like `nest.Get` or `nest.Post`, router decorator functions in the `TypedRoute` supports [ExceptionManager](#exceptionmanager), who can convert custom error classes to the regular `nest.HttpException class`.

Therefore, with the `TypedRoute` and [ExceptionManager](#exceptionmanager), you can manage your custom error classes much systematically. You can avoid 500 internal server error or hard coding implementations about the custom error classes.

```typescript
import helper from "nestia-helper";
import * as nest from "@nestjs/common";
import * as orm from "typeorm";

@nest.Controller("shopping/sales")
export class ShoppingSalesController
{
    @helper.TypedRoute.Get(":id")
    public async at
        (
            @helper.TypedParam("id", "string") id: string,
        ): Promise<IShoppingSale>
    {
        // when `orm.EntityNotFound` occurs, 
        // it would be replaced to the `404` error
        const sale: ShoppingSale = await ShoppingSale.findOneOrFail(id);
        return await ShoppingSaleProvider.json(sale);
    }
}

helper.ExceptionManager.insert(orm.EntityNotFoundError, exp => 
{
    return new nest.NotFoundException(exp.message);
});
```

### TypedParam
URL parameter decorator with type.

`TypedParam` is a decorator function getting specific typed parameter from the HTTP request URL. It's almost same with the `nest.Param`, but `TypedParam` can specify the parameter type manually. Beside, the `nest.Param` always parses all of the parameters as string type.

```typescript
@nest.Controller("shopping/sales")
export class ShoppingSalesController
{
    @helper.TypedRoute.Get(":section/:id/:paused")
    public async pause
        (
            @helper.TypedParam("section", "string") section: string,
            @helper.TypedParam("id", "number") id: number,
            @helper.TypedParam("paused", "boolean") paused: boolean
        ): Promise<void>;
}
```

### PlainBody
Plain body decorator.

`PlainBody` is a decorator function getting full body text from the HTTP request.

If you adjust the regular `nest.Body` decorator function to the body parameter, you can't get the full body text because the `nest.Body` tries to convert the body text to JSON object. Therefore, nestia-helper provides this `PlainBody` decorator function to get the full body text.

```typescript
@nest.Controller("memo")
export class MemoController
{
    @helper.TypedRoute.Post()
    public async store
        (
            @helper.PlainBody() input: string
        ): Promise<IMemo>;
}
```




## Appendix
### Template Project
https://github.com/samchon/backend

I support template backend project using this `nestia-helper` library, [backend](https://github.com/samchon/backend).

Also, reading the README content of the [backend](https://github.com/samchon/backend) template repository, you can find lots of example backend projects who've been generated from the [backend](https://github.com/samchon/backend). Furthermore, the example projects guide how to generate SDK library from the [nestia](https://github.com/samchon/nestia) and how to distribute the SDK library thorugh the NPM module.

Therefore, if you're planning to compose your own backend project using this `nestia-helper` with [nestia](https://github.com/samchon/nestia), I recommend you to create the repository and learn from the [backend](https://github.com/samchon/backend) template project.

### Nestia
https://github.com/samchon/nestia

As I've mentioned, this `nestia-helper` is a type of helper library for the `NestJS` and [nestia](https://github.com/samchon/nestia). With the [nestia](https://github.com/samchon/nestia), you don't need to write any swagger comment. Just deliver the SDK library who've built by the [nestia](https://github.com/samchon/nestia).

When you're developing a backend server using the `NestJS`, you don't need any extra dedication, for delivering the Rest API to the client developers, like writing the `swagger` comments. You just run this [nestia](https://github.com/samchon/nestia) up, then [nestia](https://github.com/samchon/nestia) would generate the SDK automatically, by analyzing your controller classes in the compliation and runtime level.

With the automatically generated SDK through this [nestia](https://github.com/samchon/nestia), client developer also does not need any extra work, like reading `swagger` and writing the duplicated interaction code. Client developer only needs to import the SDK and calls matched function with the await symbol.

```typescript
import api from "@samchon/bbs-api";
import { IBbsArticle } from "@samchon/bbs-api/lib/structures/bbs/IBbsArticle";
import { IPage } from "@samchon/bbs-api/lib/structures/common/IPage";

export async function test_article_read(connection: api.IConnection): Promise<void>
{
    // LIST UP ARTICLE SUMMARIES
    const index: IPage<IBbsArticle.ISummary> = await api.functional.bbs.articles.index
    (
        connection,
        "free",
        { limit: 100, page: 1 }
    );

    // READ AN ARTICLE DETAILY
    const article: IBbsArticle = await api.functional.bbs.articles.at
    (
        connection,
        "free",
        index.data[0].id
    );
    console.log(article.title, aritlce.body, article.files);
}
```

### Safe-TypeORM
https://github.com/samchon/safe-typeorm

[safe-typeorm](https://github.com/samchon/safe-typeorm) is another library that what I've developed, helping `TypeORM` in the compilation level and optimizes DB performance automatically without any extra dedication.

Therefore, this [nestia](https://github.com/samchon/nestia) makes you to be much convenient in the API interaction level and safe-typeorm helps you to be much convenient in the DB interaction level. With those [nestia](https://github.com/samchon/nestia) and [safe-typeorm](https://github.com/samchon/safe-typeorm), let's implement the backend server much easily and conveniently.

  - When writing [**SQL query**](https://github.com/samchon/safe-typeorm#safe-query-builder),
    - Errors would be detected in the **compilation** level
    - **Auto Completion** would be provided
    - **Type Hint** would be supported
  - You can implement [**App-join**](https://github.com/samchon/safe-typeorm#app-join-builder) very conveniently
  - When [**SELECT**ing for **JSON** conversion](https://github.com/samchon/safe-typeorm#json-select-builder)
    - [**App-Join**](https://github.com/samchon/safe-typeorm#app-join-builder) with the related entities would be automatically done
    - Exact JSON **type** would be automatically **deduced**
    - The **performance** would be **automatically tuned**
  - When [**INSERT**](https://github.com/samchon/safe-typeorm#insert-collection)ing records
    - Sequence of tables would be automatically sorted by analyzing dependencies
    - The **performance** would be **automatically tuned**

![Safe-TypeORM Demo](https://raw.githubusercontent.com/samchon/safe-typeorm/master/assets/demonstrations/safe-query-builder.gif)
