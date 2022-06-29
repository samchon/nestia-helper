import ts from "typescript";
import { IProject } from "typescript-json/lib/transformers/IProject";

import { ExpressionTransformer } from "./ExpressionTransformer";

export namespace DecoratorTransformer {
    export function transform(
        project: IProject,
        type: ts.Type,
        decorator: ts.Decorator,
    ): ts.Decorator {
        if (!ts.isCallExpression(decorator.expression)) return decorator;

        return ts.factory.createDecorator(
            ExpressionTransformer.transform(
                project,
                type,
                decorator.expression,
            ),
        );
    }
}
