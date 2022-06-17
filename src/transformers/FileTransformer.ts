import ts from "typescript";
import NestedError from "nested-error-stacks";
import { IProject } from "typescript-json/lib/structures/IProject";

import { NodeTransformer } from "./NodeTransformer";
import { IModuleImport } from "typescript-json/lib/structures/IModuleImport";

export namespace FileTransformer {
    export function transform(
        project: IProject,
        context: ts.TransformationContext,
        file: ts.SourceFile,
    ): ts.SourceFile {
        // CONFIGURE IMPORT INFO
        const modulo: IModuleImport = {
            name: "__TSON_" + Math.random().toString().slice(2),
            used: false,
            from: "lib",
        };

        // ITERATE NODES
        file = ts.visitEachChild(
            file,
            (node) => iterate_node(project, context, node, modulo),
            context,
        );

        // IMPORT REQUIRED MODULES
        if (modulo.used === true) {
            file = ts.factory.updateSourceFile(file, [
                ts.factory.createImportDeclaration(
                    undefined,
                    undefined,
                    ts.factory.createImportClause(
                        false,
                        undefined,
                        ts.factory.createNamespaceImport(
                            ts.factory.createIdentifier(modulo.name),
                        ),
                    ),
                    ts.factory.createStringLiteral("typescript-json"),
                ),
                ...file.statements,
            ]);
        }
        return file;
    }

    function iterate_node(
        project: IProject,
        context: ts.TransformationContext,
        node: ts.Node,
        modulo: IModuleImport,
    ): ts.Node {
        return ts.visitEachChild(
            try_transform_node(project, node, modulo),
            (child) => iterate_node(project, context, child, modulo),
            context,
        );
    }

    function try_transform_node(
        project: IProject,
        node: ts.Node,
        modulo: IModuleImport,
    ): ts.Node {
        try {
            return NodeTransformer.transform(project, node, modulo);
        } catch (exp) {
            if (
                exp instanceof Error &&
                exp.message.indexOf("Error on TSON") !== -1
            )
                throw exp;

            const file: ts.SourceFile = node.getSourceFile();
            const { line, character } = file.getLineAndCharacterOfPosition(
                node.pos,
            );

            throw new NestedError(
                `Error on TSON.tranformer(): failed to transform - ${
                    file.fileName
                }:${line + 1}:${character + 1}`,
                exp as Error,
            );
        }
    }
}
