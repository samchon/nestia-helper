import * as express from "express";
import * as nest from "@nestjs/common";
import helper from "../../src/index";

import { ISaleInquiry } from "../api/structures/ISaleInquiry";
import { IPage } from "../api/structures/IPage";

export function SaleInquiriesController<
    Content extends ISaleInquiry.IContent,
    Store extends ISaleInquiry.IStore,
    Json extends ISaleInquiry<Content>,
>(stringifiers: SaleInquiriesController.IStringifiers<Json>) {
    class SaleInquiriesController {
        protected constructor(
            private readonly convert: (input: Store) => Json,
        ) {}

        @helper.TypedRoute.Get(stringifiers.index)
        public async index(
            @nest.Request() request: express.Request,
            @helper.TypedParam("section", "string") section: string,
            @helper.TypedParam("saleId", "string") saleId: string,
            @nest.Body() input: IPage.IRequest,
        ): Promise<IPage<Json>> {
            request;
            section;
            saleId;
            input;

            return null!;
        }

        /**
         * Store a new inquiry.
         *
         * Write a new article inquirying about a sale.
         *
         * @param request Instance of the Express.Request
         * @param section Code of the target section
         * @param saleId ID of the target sale
         * @param input Content to archive
         * @return Newly archived inquiry
         *
         * @throw 400 bad request error when type of the input data is not valid
         * @throw 401 unauthorized error when you've not logged in yet
         */
        @helper.TypedRoute.Post(stringifiers.at)
        public async store(
            @nest.Request() request: express.Request,
            @helper.TypedParam("section", "string") section: string,
            @helper.TypedParam("saleId", "string") saleId: string,
            @nest.Body() input: Store,
        ): Promise<Json> {
            request;
            section;
            saleId;

            const data = this.convert(input);
            return data;
        }
    }
    return SaleInquiriesController;
}
export namespace SaleInquiriesController {
    export interface IStringifiers<Json extends object> {
        index(input: IPage<Json>): string;
        at(input: Json): string;
    }
}
