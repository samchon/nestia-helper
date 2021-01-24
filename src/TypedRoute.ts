import * as nest from "@nestjs/common";
import { TypedRouteInterceptor } from "./internal/TypedRouteInterceptor";

export namespace TypedRoute
{
    export function Get(path?: string)
    {
        return nest.applyDecorators(
            nest.Get(path),
            nest.UseInterceptors(new TypedRouteInterceptor())
        );
    }

    export function Post(path?: string)
    {
        return nest.applyDecorators(
            nest.Post(path),
            nest.UseInterceptors(new TypedRouteInterceptor())
        );
    }

    export function Patch(path?: string)
    {
        return nest.applyDecorators(
            nest.Patch(path),
            nest.UseInterceptors(new TypedRouteInterceptor())
        );
    }

    export function Put(path?: string)
    {
        return nest.applyDecorators(
            nest.Put(path),
            nest.UseInterceptors(new TypedRouteInterceptor())
        );
    }

    export function Delete(path?: string)
    {
        return nest.applyDecorators(
            nest.Delete(path),
            nest.UseInterceptors(new TypedRouteInterceptor())
        );
    }
}