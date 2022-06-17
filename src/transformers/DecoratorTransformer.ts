import ts from "typescript";
import { IProject } from "typescript-json/lib/structures/IProject";
import { IModuleImport } from "typescript-json/lib/structures/IModuleImport";

import { ExpressionTransformer } from "./ExpressionTransformer";

export namespace DecoratorTransformer {
    export function transform(
        project: IProject,
        type: ts.Type,
        decorator: ts.Decorator,
        modulo: IModuleImport,
    ): ts.Decorator {
        if (!ts.isCallExpression(decorator.expression)) return decorator;

        return ts.factory.createDecorator(
            ExpressionTransformer.transform(
                project,
                type,
                decorator.expression,
                modulo,
            ),
        );
    }
}
