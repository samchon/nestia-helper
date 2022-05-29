import { assertType } from "typescript-is";

import api from "../api";
import { ISystem } from "../api/structures/ISystem";

export async function test_system(connection: api.IConnection): Promise<void> {
    const system: ISystem = await api.functional.system.get(connection);
    assertType<typeof system>(system);
}
