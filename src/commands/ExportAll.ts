import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class ExportAll {
  
  public static async start(uri: vscode.Uri) {
    try {
      const excludeFiles: string | undefined = vscode.workspace.getConfiguration().get('exportall.config.exclude');
      let files = fs.readdirSync(uri.path);
      if (files && files.length > 0) {
        files = files.filter(file => (file.endsWith(".ts") || file.endsWith(".tsx")) && file.toLowerCase() !== "index.ts");
        if (excludeFiles) {
          const filesToExclude = excludeFiles.split(",");
          for (const exclude of filesToExclude) {
            files = files.filter(file => file.indexOf(exclude) === -1);
          }
        }
      }

      // Check if there are still files after the filter
      if (files && files.length > 0) {
        let output = files.map((file) => {
          const fileWithoutExtension = file.split(".").slice(0, -1).join(".");
          return `export * from './${fileWithoutExtension}';\n`;
        });

        if (output && output.length > 0) {
          fs.writeFileSync(path.join(uri.path, "index.ts"), output.join(""));
          vscode.window.showInformationMessage("Exported all files");
        }
      }
    } catch (e) {
      console.error(e.message);
      vscode.window.showErrorMessage("Sorry, something failed when exporting all modules in the current folder.");
    }
  }
}