import * as typescript from "typescript";

export const parseFileForNamedExports = (fileContents: string) => {
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
    const hasExport = node.modifiers?.some(
      (m) => m.kind === typescript.SyntaxKind.ExportKeyword
    );

    if (
      (typescript.isTypeAliasDeclaration(node) ||
        typescript.isInterfaceDeclaration(node)) &&
      hasExport
    ) {
      typeExports.add(node.name.getText());
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
    } else if (typescript.isEnumDeclaration(node) && hasExport) {
      namedExports.add(node.name.getText());
    } else if (typescript.isClassDeclaration(node) && hasExport) {
      if (node.name) {
        namedExports.add(node.name.getText());
      }
    } else if (typescript.isExportAssignment(node)) {
      namedExports.add(node.expression.getText());
    } else if (
      (typescript.isFunctionDeclaration(node) ||
        typescript.isVariableStatement(node)) &&
      hasExport
    ) {
      const names = typescript.isFunctionDeclaration(node)
        ? [node.name?.getText()].filter(Boolean)
        : node.declarationList.declarations.map((d) => d.name.getText());
      names.forEach((name) => {
        if (name) {
          namedExports.add(name);
        }
      });
    }

    typescript.forEachChild(node, parseFile);
  };

  parseFile(sourceFile);

  return {
    namedExports: Array.from(namedExports),
    typeExports: Array.from(typeExports),
  };
};
