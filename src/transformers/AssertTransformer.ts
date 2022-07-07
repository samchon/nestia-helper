import path from "path";
import ts from "typescript";
import { IProject } from "typescript-json/lib/transformers/IProject";
import { AssertProgrammer } from "typescript-json/lib/programmers/AssertProgrammer";

export namespace AssertTransformer {
    export function transform(
        project: IProject,
        type: ts.Type,
        decorator: ts.Decorator,
    ): ts.Decorator {
        if (!ts.isCallExpression(decorator.expression)) return decorator;
        return ts.factory.createDecorator(
            assert(project, type, decorator.expression),
        );
    }

    function assert(
        project: IProject,
        type: ts.Type,
        expression: ts.CallExpression,
    ): ts.LeftHandSideExpression {
        // CHECK SIGNATURE
        const signature: ts.Signature | undefined =
            project.checker.getResolvedSignature(expression);
        if (!signature || !signature.declaration) return expression;

        // CHECK TO BE TRANSFORMED
        const validate: boolean = (() => {
            // CHECK FILENAME
            const location: string = path.resolve(
                signature.declaration.getSourceFile().fileName,
            );
            if (LIB_PATHS.some((str) => str === location) === false)
                return false;
            // CHECK DUPLICATED TRANSFORMATION
            return expression.arguments.length === 0;
        })();
        if (validate === false) return expression;

        // CHECK TYPE NODE
        const typeNode: ts.TypeNode | undefined =
            project.checker.typeToTypeNode(type, undefined, undefined);
        if (typeNode === undefined) return expression;

        //----
        // TRANSFORMATION
        //----
        // GENERATE ASSERT PLAN
        const arrow: ts.ArrowFunction = AssertProgrammer.generate(
            project,
            expression.expression,
        )(type);

        // UPDATE DECORATOR FUNCTION CALL
        return ts.factory.updateCallExpression(
            expression,
            expression.expression,
            expression.typeArguments,
            [arrow],
        );
    }

    function generate_lib_paths(extension: string): string[] {
        return ["EncryptedBody", "TypedBody"].map((name) =>
            path.resolve(path.join(__dirname, "..", `${name}.${extension}`)),
        );
    }
    const LIB_PATHS = [
        ...generate_lib_paths("d.ts"),
        ...generate_lib_paths("ts"),
    ];
}
