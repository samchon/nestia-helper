import path from "path";
import ts from "typescript";

import { IProject } from "typescript-json/lib/structures/IProject";
import { IMetadata } from "typescript-json/lib/structures/IMetadata";
import { ExpressionFactory } from "typescript-json/lib/factories/ExpressionFactory";
import { MetadataFactory } from "typescript-json/lib/factories/MetadataFactory";
import { SchemaFactory } from "typescript-json/lib/factories/SchemaFactory";

export namespace ExpressionTransformer
{
    export function transform
        (
            project: IProject,
            type: ts.Type,
            expression: ts.CallExpression
        ): ts.LeftHandSideExpression
    {
        // CHECK SIGNATURE
        const signature: ts.Signature | undefined = project.checker.getResolvedSignature(expression);
        if (!signature || !signature.declaration)
            return expression;

        // CHECK TO BE TRANSFORMED
        const validate: boolean = (() =>
        {
            // CHECK GENERIC TYPE
            if (type.isTypeParameter() === true)
                return false;
            
            // CHECK FILENAME
            const location: string = path.resolve(signature.declaration.getSourceFile().fileName);
            if (LIB_PATHS.some(str => str === location) === false)
                return false;
            
            // CHECK DUPLICATE BOOSTER
            else if (expression.arguments.length >= 2)
                return false;
            else if (expression.arguments.length !== 0)
            {
                const last: ts.Expression = expression.arguments[expression.arguments.length - 1];
                if (ts.isTupleTypeNode(last) 
                    && last.elements.length === 2 
                    && ts.isArrowFunction(last.elements[1]))
                    return false;
                else if (ts.isFunctionLike(last))
                    return false;
            }

            return true;
        })();
        if (validate === false)
            return expression;

        // GENERATE STRINGIFY PLAN
        const metadata: IMetadata.IApplication | null = MetadataFactory.generate
        (
            project.checker,
            type
        );
        const app = SchemaFactory.application(metadata, SchemaFactory.JSON_PREFIX);
        const literal = ExpressionFactory.generate(app);

        // UPDATE DECORATOR FUNCTION CALL
        return ts.factory.updateCallExpression
        (
            expression,
            expression.expression,
            expression.typeArguments,
            [
                ...expression.arguments,
                literal
            ]
        );
    }

    function generate_lib_paths(extension: string): string[]
    {
        return ["EncryptedRoute", "TypedRoute"]
            .map(name => path.resolve(path.join(__dirname, "..", `${name}.${extension}`)));
    }
    const LIB_PATHS = [...generate_lib_paths("d.ts"), ...generate_lib_paths("ts")];
}