import * as typescript from 'typescript';

export const parseFileForNamedExports = (fileContents: string) => {
    const namedExports: string[] = [];
    const typeExports: string[] = [];
    const sourceFile = typescript.createSourceFile(
      'temp.ts',
      fileContents,
      typescript.ScriptTarget.Latest,
      true,
      typescript.ScriptKind.TS
    );

    const parseFile = (node: typescript.Node) => {
        if (typescript.isExportDeclaration(node)) {
            if (node.exportClause && typescript.isNamedExports(node.exportClause)) {
                node.exportClause.elements.forEach(element => namedExports.push(element.name.getText()));
            }
            if (node.moduleSpecifier) {
                namedExports.push(node.moduleSpecifier.getText());
            }
        } else if (typescript.isExportAssignment(node)) {
            namedExports.push(node.expression.getText());
        } else if (typescript.isExportSpecifier(node)) {
            namedExports.push(node.name.getText());
        } else if ((typescript.isFunctionDeclaration(node) || typescript.isClassDeclaration(node) || typescript.isInterfaceDeclaration(node)) && node.modifiers?.some(m => m.kind === typescript.SyntaxKind.ExportKeyword)) {
            namedExports.push(node.name?.getText() || '');
        } else if (typescript.isTypeAliasDeclaration(node) && node.modifiers?.some(m => m.kind === typescript.SyntaxKind.ExportKeyword)) {
            typeExports.push(node.name?.getText() || '');
        } else if (typescript.isVariableStatement(node) && node.modifiers?.some(m => m.kind === typescript.SyntaxKind.ExportKeyword)) {
            node.declarationList.declarations.forEach(declaration => namedExports.push(declaration.name.getText()));
        }
        typescript.forEachChild(node, parseFile);
    };

    parseFile(sourceFile);

    return { namedExports, typeExports };
};
