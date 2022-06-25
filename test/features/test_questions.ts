import TSON from "typescript-json";

import api from "../api";
import { ISaleQuestion } from "../api/structures/ISaleQuestion";

export async function test_question(
    connection: api.IConnection,
): Promise<void> {
    const question: ISaleQuestion =
        await api.functional.consumers.sales.questions.store(
            connection,
            "generla",
            "sale-id",
            {
                title: "some-title",
                body: "some-body",
                files: [],
            },
        );
    TSON.assertType<typeof question>(question);
}
