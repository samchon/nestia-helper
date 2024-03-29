import * as nest from "@nestjs/common";
import TSON from "typescript-json";

import { SaleInquiriesController } from "./SaleInquiriesController";
import { ISaleReview } from "../api/structures/ISaleReview";

@nest.Controller("consumers/:section/sales/:saleId/reviews")
export class ConsumerSaleReviewsController extends SaleInquiriesController<
    ISaleReview.IContent,
    ISaleReview.IStore,
    ISaleReview
>({
    index: (input) => TSON.stringify(input),
    at: (input) => TSON.stringify(input),
    assert: (input) => TSON.assertType(input),
}) {
    public constructor() {
        super((input) => ({
            id: 0,
            writer: "someone",
            contents: [
                {
                    id: "some-id",
                    title: input.title,
                    body: input.body,
                    score: input.score,
                    files: input.files,
                    created_at: new Date().toString(),
                },
            ],
            answer: null,
            hit: 0,
            created_at: new Date().toString(),
        }));
    }
}
