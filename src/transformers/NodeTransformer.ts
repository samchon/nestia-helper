import ts from "typescript";
import { IProject } from "typescript-json/lib/transformers/IProject";
import { MethodTransformer } from "./MethodTransformer";
import { ParameterTransformer } from "./ParameterTransformer";

export namespace NodeTransformer {
    export function transform(project: IProject, node: ts.Node): ts.Node {
        if (ts.isMethodDeclaration(node))
            return MethodTransformer.transform(project, node);
        else if (ts.isParameter(node))
            return ParameterTransformer.transform(project, node);
        return node;
    }
}
