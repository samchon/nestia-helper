import ts from "typescript";
import { IProject } from "typescript-json/lib/transformers/IProject";
import { AssertTransformer } from "./AssertTransformer";

export namespace ParameterTransformer {
    export function transform(
        project: IProject,
        param: ts.ParameterDeclaration,
    ): ts.ParameterDeclaration {
        if (!param.decorators?.length) return param;

        const type: ts.Type = project.checker.getTypeAtLocation(param);
        return ts.factory.updateParameterDeclaration(
            param,
            param.decorators.map((decorator) =>
                AssertTransformer.transform(project, type, decorator),
            ),
            param.modifiers,
            param.dotDotDotToken,
            param.name,
            param.questionToken,
            param.type,
            param.initializer,
        );
    }
}
