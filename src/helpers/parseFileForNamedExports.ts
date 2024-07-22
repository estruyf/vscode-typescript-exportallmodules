import * as typescript from "typescript";
import { hasExport, isDefaultExport } from ".";

/**
 * Parses a TypeScript file for named exports and type exports.
 *
 * @param fileContents - The contents of the TypeScript file.
 * @param filename - The name of the file.
 * @returns An object containing the named exports and type exports found in the file.
 */
export const parseFileForNamedExports = (
  fileContents: string,
  filename: string
) => {
  const namedExports = new Set<string>();
  const typeExports = new Set<string>();
  const sourceFile = typescript.createSourceFile(
    "temp.ts",
    fileContents,
    typescript.ScriptTarget.Latest,
    true,
    typescript.ScriptKind.TS
  );

  const parseFile = (node: typescript.Node) => {
    if (
      (typescript.isTypeAliasDeclaration(node) ||
        typescript.isInterfaceDeclaration(node)) &&
      hasExport(node)
    ) {
      if (isDefaultExport(node)) {
        typeExports.add(`default as ${node.name.getText()}`);
      } else {
        typeExports.add(node.name.getText());
      }
    } else if (
      typescript.isExportDeclaration(node) &&
      node.exportClause &&
      typescript.isNamedExports(node.exportClause)
    ) {
      const isTypeExport = node.getText().startsWith("export type");
      const targetSet = isTypeExport ? typeExports : namedExports;

      node.exportClause.elements.forEach((element) => {
        if (typescript.isExportSpecifier(element)) {
          targetSet.add(element.name.getText());
        }
      });
    } else if (typescript.isEnumDeclaration(node) && hasExport(node)) {
      namedExports.add(node.name.getText());
    } else if (typescript.isClassDeclaration(node) && hasExport(node)) {
      const className = node.name?.getText();
      if (isDefaultExport(node) && className) {
        namedExports.add(`default as ${className}`);
      } else if (isDefaultExport(node) && !className) {
        namedExports.add(`default as ${filename}`);
      } else if (className) {
        namedExports.add(className);
      }
    } else if (typescript.isExportAssignment(node)) {
      const expression = node.expression.getText();

      if (isDefaultExport(node)) {
        if (!typescript.isIdentifier(node.expression)) {
          namedExports.add(`default as ${filename}`);
        } else {
          namedExports.add(`default as ${expression}`);
        }
      } else {
        namedExports.add(expression);
      }
    } else if (typescript.isFunctionDeclaration(node) && hasExport(node)) {
      const funcName = node.name?.getText();
      const isDefault = isDefaultExport(node);

      if (isDefaultExport(node) && funcName) {
        namedExports.add(`default as ${funcName}`);
      } else if (isDefaultExport(node) && !funcName) {
        namedExports.add(`default as ${filename}`);
      } else if (funcName) {
        namedExports.add(funcName);
      }
    } else if (typescript.isVariableDeclarationList(node)) {
      const names = node.declarations.map((d) => d.name.getText());

      const parent =
        node.parent.kind === typescript.SyntaxKind.VariableStatement
          ? node.parent
          : null;
      if (parent && hasExport(parent)) {
        names.forEach((name) => {
          namedExports.add(name);
        });
      }
    }

    typescript.forEachChild(node, parseFile);
  };

  parseFile(sourceFile);

  return {
    namedExports: Array.from(namedExports),
    typeExports: Array.from(typeExports),
  };
};
