# Nestia Helper
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/nestia-helper/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/nestia-helper.svg)](https://www.npmjs.com/package/nestia-helper)
[![Downloads](https://img.shields.io/npm/dm/nestia-helper.svg)](https://www.npmjs.com/package/nestia-helper)
[![Build Status](https://github.com/samchon/nestia-helper/workflows/build/badge.svg)](https://github.com/samchon/nestia-helper/actions?query=workflow%3Abuild)

Helper library of `NestJS` through `typescript-json`.

`nestia-helper` is a helper library of `NestJS`, which boosts up `JSON.stringify()` function about 5x times faster, of the API responses. Also, `nestia-helper` automatically converts error, occured by `TSON.assertType()` function, to 400 status coded response. Therefore, you can easily validate request data type thorugh the `TSON.assertType()` function.

Read the below code and feel how `nestia-helper` and `typescript-json` makes `NestJS` stronger.

```typescript
import TSON from "typescript-json";
import helper from "nestia-helper";
import * as nest from "@nestjs/common";

@nest.Controller("bbs/articles")
export class BbsArticlesController {
    // JSON.stringify() for `IPage<IBbsArticle.ISummary>` 
    // would be boosted up about 5x times faster 
    @helper.TypedRoute.Patch()
    public get(
        @nest.Body() input: IPage.IRequest
    ): Promise<IPage<IBbsArticle.ISummary>> {
        // when input value is not following its type,
        // `TypeGuardError` would be thrown and
        // 400 status code would be responded
        assertType(input); 

        const stmt = ArticleService.summarize(input.search);

        // JSON-string generation, for response, 
        // would be 5x times faster
        return Paginator.paginate(stmt, input);
    }
}
```




## Setup
### NPM Package
At first, install this `nestia-helper` by the `npm install` command. 

Also, you need additional `devDependencies` to compile the TypeScript code with transformation. Therefore, install those all libraries `typescript`, `ttypescript` and `ts-node`. Inform that, `ttypescript` is not mis-writing. Therefore, do not forget to install the `ttypescript`.

```bash
npm install --save nestia-helper

npm install --save-dev typescript
npm install --save-dev ttypescript
npm install --save-dev ts-node
```

### tsconfig.json
After the installation, you've to configure the `tsconfig.json` file like below. 

Add the new property `transform` and its value `typescript-json/lib/transform` into the `compilerOptions.plugins` array. Also, I recommend you to use the `strict` option, to enforce developers to distinguish whether each property is nullable or undefindable.

From now on, your NestJS backend server can convert response data to JSON-string 5x times faster, if you're utilizing [TypedRoute](#typedroute) or [EncryptedRoute](#encryptedroute). However, Automatic converter from `TSON.assertType()` function error to 400 status coded response does not require such `plugins` configuration.

Therefore, you want only the `TSON.assertType()` function error converter only, skip this configuration.

```json
{
  "strict": true,
  "compilerOptions": {
    "plugins": [
      {
        "transform": "nestia-helper/lib/transform"
      }
    ]
  }
}
```




## Features
### TypedRoute
Router decorator functions.

`TypedRoute` is an utility class containing router decorator functions.

If you've configured the [tsconfig.json](#tsconfigjson), JSON string conversion speed of response data would be boosted up about 5x times faster. Otherwise, you've not configured [tsconfig.json](#tsconfigjson), only 400 status response converter from `TSON.assertType()` function error would be activated.

For reference, with `TypedRoute` and `Exception`, you can add custom error converter like below.

```typescript
import helper from "nestia-helper";
import * as nest from "@nestjs/common";
import * as orm from "typeorm";

@nest.Controller("shopping/sales/:id/articles")
export class ShoppingSaleArticlesController
{
    @helper.TypedRoute.Patch()
    public async index
        (
            @helper.TypedParam("id", "string") id: string,
            @nest.Body() input: IPage.IRequest
        ): Promise<IShoppingSale>
    {
        // when input value is not following its type,
        // `TypeGuardError` would be thrown and
        // 400 status code would be responded
        assertType(input); 

        // when `orm.EntityNotFound` occurs, 
        // it would be replaced to the `404` error
        const sale: ShoppingSale = await ShoppingSale.findOneOrFail(id);

        // JSON-string generation, for response, 
        // would be 5x times faster
        const stmt = ShoppingSaleArticleService.summarize(sale, input.search);
        return Paginator.paginate(stmt, input);
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
            @helper.TypedParam("id", "uuid") id: number,
            @helper.TypedParam("paused", "boolean") paused: boolean
        ): Promise<void>;
}
```

### EncryptedRoute
Encrypted router decorator functions.

`EncryptedRoute` is almost same with [TypedRoute](#typedroute). Only difference is whether to encrypt response body or not. 

For referecen, `EncryptedRoute` encrypts response body using those options. But don't feel annoying. You can generate SDK library for client developers very easily through [nestia](https://github.com/samchon/nestia), which encrypts and descrypts the AES-125/256 content automatically.

  - AES-128/256
  - CBC mode
  - PKCS #5 Padding
  - Base64 Encoding

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

  - `typescript-json.TypeGuardError`
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

Automatic `SDK` and `Swagger` generator for the `NestJS`, evolved than ever.

`nestia` is an evolved `SDK` and `Swagger` generator, which analyzes your `NestJS` server code in the compilation level. With `nestia` and compilation level analyzer, you don't need to write any swagger or class-validator decorators.

Reading below table and example code, feel how the "compilation level" makes `nestia` stronger.

Components | `nestia`::SDK | `nestia`::swagger | `@nestjs/swagger`
-----------|---|---|---
Pure DTO interface | ✔ | ✔ | ❌
Description comments | ✔ | ✔ | ❌
Simple structure | ✔ | ✔ | ✔
Generic type | ✔ | ✔ | ❌
Union type | ✔ | ✔ | ▲
Intersection type | ✔ | ✔ | ▲
Conditional type | ✔ | ▲ | ❌
Auto completion | ✔ | ❌ | ❌
Type hints | ✔ | ❌ | ❌
2x faster `JSON.stringify()` | ✔ | ❌ | ❌
Ensure type safety | ✅ | ❌ | ❌

```typescript
// IMPORT SDK LIBRARY GENERATED BY NESTIA
import api from "@samchon/shopping-api";
import { IPage } from "@samchon/shopping-api/lib/structures/IPage";
import { ISale } from "@samchon/shopping-api/lib/structures/ISale";
import { ISaleArticleComment } from "@samchon/shopping-api/lib/structures/ISaleArticleComment";
import { ISaleQuestion } from "@samchon/shopping-api/lib/structures/ISaleQuestion";

export async function trace_sale_question_and_comment
    (connection: api.IConnection): Promise<void>
{
    // LIST UP SALE SUMMARIES
    const index: IPage<ISale.ISummary> = await api.functional.shoppings.sales.index
    (
        connection,
        "general",
        { limit: 100, page: 1 }
    );

    // PICK A SALE
    const sale: ISale = await api.functional.shoppings.sales.at
    (
        connection, 
        index.data[0].id
    );
    console.log("sale", sale);

    // WRITE A QUESTION
    const question: ISaleQuestion = await api.functional.shoppings.sales.questions.store
    (
        connection,
        "general",
        sale.id,
        {
            title: "How to use this product?",
            body: "The description is not fully enough. Can you introduce me more?",
            files: []
        }
    );
    console.log("question", question);

    // WRITE A COMMENT
    const comment: ISaleArticleComment = await api.functional.shoppings.sales.comments.store
    (
        connection,
        "general",
        sale.id,
        question.id,
        {
            body: "p.s) Can you send me a detailed catalogue?",
            anonymous: false
        }
    );
    console.log("comment", comment);
}
```