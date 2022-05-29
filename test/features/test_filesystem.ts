import { assertType } from "typescript-is";

import api from "../api";
import { IFilesystemBucket } from "../api/structures/IFilesystemBucket";

export async function test_filesystem(
    connection: api.IConnection,
): Promise<void> {
    const buckets: IFilesystemBucket[] = await api.functional.filesystem.get(
        connection,
    );
    assertType<typeof buckets>(buckets);
}
