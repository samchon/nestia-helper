import * as express from "express";
import * as nest from "@nestjs/common";
import helper from "../../src/index";

import { ISaleInquiry } from "../api/structures/ISaleInquiry";

export abstract class SaleInquiriesController<
        Content extends ISaleInquiry.IContent,
        Store extends ISaleInquiry.IStore,
        Json extends ISaleInquiry<Content>>
{
    protected constructor(private readonly convert: (input: Store) => Json)
    {
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
    @helper.TypedRoute.Post()
    public async store
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("section", "string") section: string, 
            @helper.TypedParam("saleId", "string") saleId: string,
            @nest.Body() input: Store
        ): Promise<Json>
    {
        request;
        section;
        saleId;

        return this.convert(input);
    }
}