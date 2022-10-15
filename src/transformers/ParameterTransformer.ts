import ts from "typescript";
import { IProject } from "typescript-json/lib/transformers/IProject";
import { AssertTransformer } from "./AssertTransformer";

export namespace ParameterTransformer {
    export function transform(
        project: IProject,
        param: ts.ParameterDeclaration,
    ): ts.ParameterDeclaration {
        const decorators: readonly ts.Decorator[] | undefined = ts.getDecorators
            ? ts.getDecorators(param)
            : (param as any).decorators;
        if (!decorators?.length) return param;

        const type: ts.Type = project.checker.getTypeAtLocation(param);
        return ts.factory.updateParameterDeclaration(
            param,
            decorators.map((deco) =>
                AssertTransformer.transform(project, type, deco),
            ),
            ts.getModifiers
                ? ts.getModifiers(param) || []
                : (param as any).modifiers,
            param.dotDotDotToken,
            param.name,
            param.questionToken,
            param.type,
            param.initializer,
        );
    }
}
