import * as nest from "@nestjs/common";
import TSON from "typescript-json";

import { SaleInquiriesController } from "./SaleInquiriesController";
import { ISaleQuestion } from "../api/structures/ISaleQuestion";

@nest.Controller("consumers/:section/sales/:saleId/questions")
export class ConsumerSaleQuestionsController
    extends SaleInquiriesController<
        ISaleQuestion.IContent, 
        ISaleQuestion.IStore, 
        ISaleQuestion>(TSON.createStringifier<ISaleQuestion>())
{
    public constructor()
    {
        super(input =>
        ({
            id: 0,
            writer: "someone",
            contents: [
                {
                    id: "some-id",
                    title: input.title,
                    body: input.body,
                    files: input.files,
                    created_at: new Date().toString()
                }
            ],
            answer: null,
            hit: 0,
            created_at: new Date().toString()
        }))
    }
}