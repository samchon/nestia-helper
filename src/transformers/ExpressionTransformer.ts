import path from "path";
import ts from "typescript";
import { IProject } from "typescript-json/lib/structures/IProject";
import { StringifyProgrammer } from "typescript-json/lib/programmers/StringifyProgrammer";

export namespace ExpressionTransformer {
    export function transform(
        project: IProject,
        type: ts.Type,
        expression: ts.CallExpression,
    ): ts.LeftHandSideExpression {
        //----
        // VALIDATIONS
        //----
        // CHECK SIGNATURE
        const signature: ts.Signature | undefined =
            project.checker.getResolvedSignature(expression);
        if (!signature || !signature.declaration) return expression;

        // CHECK TO BE TRANSFORMED
        const validate: boolean = (() => {
            // CHECK GENERIC TYPE
            if (type.isTypeParameter() === true) return false;

            // CHECK FILENAME
            const location: string = path.resolve(
                signature.declaration.getSourceFile().fileName,
            );
            if (LIB_PATHS.some((str) => str === location) === false)
                return false;
            // CHECK DUPLICATE BOOSTER
            else if (expression.arguments.length >= 2) return false;
            else if (expression.arguments.length !== 0) {
                const last: ts.Expression =
                    expression.arguments[expression.arguments.length - 1];
                if (
                    ts.isTupleTypeNode(last) &&
                    last.elements.length === 2 &&
                    ts.isArrowFunction(last.elements[1])
                )
                    return false;
                else if (ts.isFunctionLike(last)) return false;
            }

            return true;
        })();
        if (validate === false) return expression;

        // GET TYPE NODE
        const typeNode: ts.TypeNode | undefined =
            project.checker.typeToTypeNode(type, undefined, undefined);
        if (typeNode === undefined) return expression;

        //----
        // TRANSFORMATION
        //----
        // GENERATE STRINGIFY PLAN
        const arrow: ts.ArrowFunction = StringifyProgrammer.generate(
            expression.expression,
        )(project, type);

        // UPDATE DECORATOR FUNCTION CALL
        return ts.factory.updateCallExpression(
            expression,
            expression.expression,
            expression.typeArguments,
            [...expression.arguments, arrow],
        );
    }

    function generate_lib_paths(extension: string): string[] {
        return ["EncryptedRoute", "TypedRoute"].map((name) =>
            path.resolve(path.join(__dirname, "..", `${name}.${extension}`)),
        );
    }
    const LIB_PATHS = [
        ...generate_lib_paths("d.ts"),
        ...generate_lib_paths("ts"),
    ];
}
