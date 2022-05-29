import { assertType } from "typescript-is";

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
    assertType<typeof question>(question);
}
