import crypto from "crypto";
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
        const signature: ts.Signature | undefined = project.checker.getResolvedSignature(expression);
        if (!signature || !signature.declaration)
            return expression;

        const file: string = path.resolve(signature.declaration.getSourceFile().fileName);
        const name: string = project.checker.getTypeAtLocation(signature.declaration).symbol.name;
        
        if (!LIB_PATHS.some(str => str === file) || name !== "route")
            return expression;
        else if (expression.arguments.length !== 0
            && ts.isTupleTypeNode(expression.arguments[expression.arguments.length - 1]))
        {
            const tuple: ts.TupleTypeNode = expression.arguments[expression.arguments.length - 1] as any;
            if (tuple.elements.length === 2 && ts.isArrowFunction(tuple.elements[1]))
                return expression;
        }
        else if (type.isTypeParameter())
            return expression;

        const app: IMetadata.IApplication | null = MetadataFactory.generate
        (
            project.checker,
            type
        );
        const tuple = SchemaFactory.application(app);
        const literal = ExpressionFactory.generate(tuple);

        const script: string = project.printer.printNode
        (
            ts.EmitHint.Unspecified, 
            literal,
            expression.getSourceFile()
        );
        const key: string = crypto
            .createHash("sha256")
            .update(script)
            .digest("base64");

        return ts.factory.updateCallExpression
        (
            expression,
            expression.expression,
            expression.typeArguments,
            [
                ...expression.arguments,
                ts.factory.createArrayLiteralExpression
                ([
                    ts.factory.createStringLiteral(key),
                    ts.factory.createArrowFunction
                    (
                        undefined,
                        undefined,
                        [],
                        undefined,
                        undefined,
                        literal
                    )
                ])
            ]
        );
    }
}

function generate_lib_paths(extension: string): string[]
{
    return ["EncryptedRoute", "TypedRoute"]
        .map(name => path.resolve(path.join(__dirname, "..", `${name}.${extension}`)));
}
const LIB_PATHS = [...generate_lib_paths("d.ts"), ...generate_lib_paths("ts")];