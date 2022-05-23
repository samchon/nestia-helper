import * as nest from "@nestjs/common";
import TSON from "typescript-json";

import { SaleInquiriesController } from "./SaleInquiriesController";
import { ISaleReview } from "../api/structures/ISaleReview";

const stringify = TSON.createStringifier<ISaleReview>();

@nest.Controller("consumers/:section/sales/:saleId/reviews")
export class ConsumerSaleReviewsController
    extends SaleInquiriesController<
        ISaleReview.IContent, 
        ISaleReview.IStore, 
        ISaleReview>(stringify)
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
                    score: input.score,
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