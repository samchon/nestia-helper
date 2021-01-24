import * as nest from "@nestjs/common";
import { EncryptedRouteInterceptor } from "./internal/EncryptedRouteInterceptor";

export namespace EncryptedRoute
{
    export function Get(path?: string): MethodDecorator
    {
        return nest.applyDecorators(
            nest.Get(path),
            nest.UseInterceptors(new EncryptedRouteInterceptor())
        );
    }

    export function Post(path?: string): MethodDecorator
    {
        return nest.applyDecorators(
            nest.Post(path),
            nest.UseInterceptors(new EncryptedRouteInterceptor())
        );
    }

    export function Patch(path?: string): MethodDecorator
    {
        return nest.applyDecorators(
            nest.Patch(path),
            nest.UseInterceptors(new EncryptedRouteInterceptor())
        );
    }

    export function Put(path?: string): MethodDecorator
    {
        return nest.applyDecorators(
            nest.Put(path),
            nest.UseInterceptors(new EncryptedRouteInterceptor())
        );
    }

    export function Delete(path?: string): MethodDecorator
    {
        return nest.applyDecorators(
            nest.Delete(path),
            nest.UseInterceptors(new EncryptedRouteInterceptor())
        );
    }
}