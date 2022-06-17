import TSON from "typescript-json";

import api from "../api";
import { ISystem } from "../api/structures/ISystem";

export async function test_system(connection: api.IConnection): Promise<void> {
    const system: ISystem = await api.functional.system.get(connection);
    TSON.assert<typeof system>(system);
}
