import ts from "typescript";

import { IProject } from "typescript-json/lib/transformers/IProject";
import { ITransformOptions } from "typescript-json/lib/transformers/ITransformOptions";
import { FileTransformer } from "./transformers/FileTransformer";

export default function transform(
    program: ts.Program,
    options?: ITransformOptions,
): ts.TransformerFactory<ts.SourceFile> {
    const project: IProject = {
        program,
        compilerOptions: program.getCompilerOptions(),
        checker: program.getTypeChecker(),
        printer: ts.createPrinter(),
        options: options || {},
    };
    return (context) => (file) =>
        FileTransformer.transform(project, context, file);
}
