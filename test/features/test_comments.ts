import TSON from "typescript-json";

import api from "../api";
import { ISaleArticleComment } from "../api/structures/ISaleArticleComment";

export async function test_comment(connection: api.IConnection): Promise<void> {
    const comment: ISaleArticleComment =
        await api.functional.consumers.sales.articles.comments.store(
            connection,
            "general",
            0,
            0,
            {
                body: "Hello, world!",
                annonymous: false,
            },
        );
    TSON.assertType<typeof comment>(comment);
}
