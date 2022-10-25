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
        if (ts.getDecorators !== undefined)
            return ts.factory.updateParameterDeclaration(
                param,
                (param.modifiers || []).map((mod) =>
                    ts.isDecorator(mod)
                        ? AssertTransformer.transform(project, type, mod)
                        : mod,
                ),
                param.dotDotDotToken,
                param.name,
                param.questionToken,
                param.type,
                param.initializer,
            );
        // eslint-disable-next-line
        return ts.factory.updateParameterDeclaration(
            param,
            decorators.map((deco) =>
                AssertTransformer.transform(project, type, deco),
            ),
            (param as any).modifiers,
            param.dotDotDotToken,
            param.name,
            param.questionToken,
            param.type,
            param.initializer,
        );
    }
}
