# Nestia Helper
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/nestia-helper/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/nestia-helper.svg)](https://www.npmjs.com/package/nestia-helper)
[![Downloads](https://img.shields.io/npm/dm/nestia-helper.svg)](https://www.npmjs.com/package/nestia-helper)
[![Build Status](https://github.com/samchon/nestia-helper/workflows/build/badge.svg)](https://github.com/samchon/nestia-helper/actions?query=workflow%3Abuild)

Helper library of `NestJS` through [typescript-json](https://github.com/samchon/typescript-json).

`nestia-helper` is a helper library of `NestJS`, which boosts up [`JSON.stringify()`](https://github.com/samchon/typescript-json#fastest-json-string-conversion) function about 5x times faster, of the API responses. Also, `nestia-helper` automatically validates request body from client, through the [`TSON.assert()`](https://github.com/samchon/typescript-json#runtime-validators) function.

Read the below code and feel how `nestia-helper` and `typescript-json` makes `NestJS` stronger.

```typescript
import TSON from "typescript-json";
import helper from "nestia-helper";
import * as nest from "@nestjs/common";

@nest.Controller("bbs/articles")
export class BbsArticlesController {
    //----
    // `TSON.stringify()` for `IBbsArticle` 
    // Boost up JSON conversion speed about 5x times faster 
    //----
    // `TSON.assert()` for `IBbsArticle.IStore`
    // If client request body is not following type type, 
    // `BadRequestException` (status code: 400) would be thrown
    //----
    @helper.TypedRoute.Post()
    public async store(
        // automatic validation
        @helper.TypedBody() input: IBbsArticle.IStore
    ): Promise<IBbsArticle> {
        const article: BbsArticle = await BbsArticeProvider.store(input);
        const json: IBbsArticle = await BbsArticleProvider.json().getOne(article);

        // 5x times faster JSON conversion
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
### TypedBody
Safe JSON body decorator function by [`TSON.assertType()`](https://github.com/samchon/typescript-json#runtime-type-checkers).

`TypedBody` is a decorator function which validates request body data from client, through `TSON.assertType()` function. If request body data from client is not following the promised type, 400 status error would be thrown.

```typescript
export class ShoppingSaleArticlesController {
    @helper.TypedRoute.Patch("clear")
    public async clear(
        @helper.TypedBody() input: IShoppingSaleArticle.IClear
    ): Promise<void> {
        // If client is not following the typeof `input`,
        // `BadRequestException` (status code: 400) would be thrown 
        await ShoppingSaleArticleProvider.clear(input);        
    }
}
```

### TypedRoute
Router decorator functions using [`TSON.stringify()`](https://github.com/samchon/typescript-json#fastest-json-string-conversion)

`TypedRoute` is an utility class containing router decorator functions.

JSON string conversion speed of response data would be 5x times faster.

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
            @nest.TypedBody() input: IPage.IRequest
        ): Promise<IShoppingSaleArticle>
    {
        const sale: ShoppingSale = await ShoppingSale.findOneOrFail(id);
        const stmt: orm.SelectQueryBuilder<ShoppingSaleArticle> =
            ShoppingSaleArticleProvider.summarize(sale, input.search);

        // JSON string conversion would be 5x times faster
        return Paginator.paginate(stmt, input);
    }
}
```

### TypedParam
URL parameter decorator with type.

`TypedParam` is a decorator function getting specific typed parameter from the HTTP request URL. It's almost same with the `nest.Param`, but `TypedParam` can specify the parameter type manually. Beside, the `nest.Param` always parses all of the parameters as string type.

For reference, if client requests wrong typed URL parameter, `BadRequestException` (status code: 400) would be thrown.

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

### EncryptedBody
Encrypted body decorator.

`EncryptedBody` is almost same with [TypedBody](#typedbody). Only difference is whether to encrypt request body or not.

For referece, `EncryptedBody` encrypts request body using those options. But don't feel annoying. You can generate SDK library for client developers very easily through [nestia](https://github.com/samchon/nestia), which encrypts and descrypts the AES-125/256 content automatically.

  - AES-128/256
  - CBC mode
  - PKCS #5 Padding
  - Base64 Encoding

```typescript
@nest.Controller("bbs/articles")
export class BbsArticlesController
{
    @helper.EncryptedRoute.Post()
    public async store
        (
            // Decrypt encrypted requst body
            // If client is not following `IBbsArticle.IStore` type,
            // `BadRequestException` (status code: 400) would be thrown
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

### EncryptedRoute
Encrypted router decorator functions.

`EncryptedRoute` is almost same with [TypedRoute](#typedroute). Only difference is whether to encrypt response body or not.

For referece, `EncryptedRoute` encrypts response body using those options. But don't feel annoying. You can generate SDK library for client developers very easily through [nestia](https://github.com/samchon/nestia), which encrypts and descrypts the AES-125/256 content automatically.

  - AES-128/256
  - CBC mode
  - PKCS #5 Padding
  - Base64 Encoding

```typescript
@nest.Controller("bbs/articles")
export class BbsArticlesController
{
    // JSON string conversion speed would be 5x times faster
    // But the boosting would be diluted by encryption
    @helper.EncryptedRoute.Get(":id")
    public async at
        (
            @nest.Param("id") id: string
        ): Promise<IBbsArticle>;
}
```

### EncryptedController
Encrypted controller.

`EncryptedController` is an extension of the `nest.Controller` class decorator function who configures encryption password of the AES-128/256 algorithm. The encryption algorithm and password would be used by [EncryptedRoute](#encryptedroute) and [EncryptedBody](#encryptedbody).

By the way, you can configure the encryption password in the global level by using [EncryptedModule](#encryptedmodule), which can replace `nest.Module`. In that case, you don't need to use this `EncryptedController` more.

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

`EncryptedModule` is an extension of the `nest.Module` class decorator function who configures encryption password of the AES-128/256 algorithm. The encryption algorithm and password would be used by [EncryptedRoute](#encryptedroute) and [EncryptedBody](#encryptedbody).

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

If you've define an API function through [TypedRoute](#typedroute) or [EncryptedRoute](#encryptedroute) and the API function throws a custom error enrolled `EntityManager`, the error would be automatically converted to the regular `nest.HttpException` instance by the `ExceptionManager.Closure` function.

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