import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getSettingName, CONFIG_EXCLUDE, CONFIG_INCLUDE_FOLDERS, CONFIG_RELATIVE_EXCLUDE, CONFIG_SEMIS, CONFIG_QUOTE, EXTENSION_NAME } from '../constants';
import { getRelativeFolderPath } from '../helpers';
import { Logger } from '../helpers/logger';

interface FileOrFolderToExport { 
  name: string; 
  type: "file" | "folder"
}

export class ExportAll {
  public static barrelFiles = ["index.ts", "index.tsx"];
  
  public static async start(uri: vscode.Uri, runSilent: boolean = true) {
    try {
      const excludeFiles: string | undefined = vscode.workspace.getConfiguration().get(getSettingName(CONFIG_EXCLUDE));
      const excludeRel: string | undefined = vscode.workspace.getConfiguration().get(getSettingName(CONFIG_RELATIVE_EXCLUDE));
      const includeFolders: boolean | undefined = vscode.workspace.getConfiguration().get(getSettingName(CONFIG_INCLUDE_FOLDERS));
      const semis: boolean | undefined = vscode.workspace.getConfiguration().get(getSettingName(CONFIG_SEMIS));
      const quote: "\"" | "'"  = vscode.workspace.getConfiguration().get(getSettingName(CONFIG_QUOTE)) ?? "'";

      const folderPath = uri.fsPath;
      const files = fs.readdirSync(folderPath);
      let filesToExport: FileOrFolderToExport[] = [];
      
      if (files && files.length > 0) {
        for (const file of files) {
          const absPath = path.join(folderPath, file);
          let include = false;
          let relPath = file;

          // Include all TS files except for the index
          if ((file.endsWith(".ts") || file.endsWith(".tsx")) && this.barrelFiles.indexOf(file.toLowerCase()) === -1) {
            relPath = getRelativeFolderPath(absPath);
            include = true;
          }

          // Check if folders should be included
          if (includeFolders) {
            // Only allow folder which contain an index file
            if (fs.lstatSync(absPath).isDirectory()) {
              for (const indexFile of this.barrelFiles) {
                const indexPath = path.join(absPath, indexFile);
                if (fs.existsSync(indexPath)) {
                  relPath = getRelativeFolderPath(absPath);
                  include = true;
                  break;
                }
              }
            }
          }

          // Check the files that need to be excluded
          if (excludeFiles && include) {
            for (const exclude of excludeFiles) {
              if (file.indexOf(exclude) !== -1 && include) {
                include = false;
              }
            }
          }

          // Check the files that need to be excluded
          if (excludeFiles && include) {
            for (const exclude of excludeFiles) {
              if (file.indexOf(exclude) !== -1 && include) {
                include = false;
              }
            }
          }

          // Check the files that need to be excluded by the relative path
          if (excludeRel && include) {
            for (const exclude of excludeRel) {
              if (relPath.toLowerCase() === exclude.toLowerCase() && include) {
                include = false;
              }
            }
          }

          // Add the file/folder to the array
          if (include) {
            try {
              filesToExport.push({
                name: file,
                type: fs.statSync(absPath).isDirectory() ? "folder" : "file"
              });
            } catch (ex) {
              // Ignore
            }
          }
        }        
      }

      // Check if there are still files after the filter
      if (filesToExport && filesToExport.length > 0) {
        let output = filesToExport.map((item) => {
          const fileWithoutExtension = item.type === "folder" ? item.name : path.parse(item.name).name;
          return `export * from ${quote}./${fileWithoutExtension}${quote}${semis ? ';' : ''}\n`;
        });

        if (output && output.length > 0) {
          const filePath = path.join(uri.fsPath, "index.ts");
          if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, "");
          }

          const fileUri = vscode.Uri.file(filePath);
          const document = await vscode.workspace.openTextDocument(fileUri);

          let fileContents = document.getText();
          let updatedFileContents = output.join("");

          if (fileContents !== updatedFileContents) {
            const documentRange = new vscode.Range(
              document.lineAt(0).range.start,
              document.lineAt(document.lineCount - 1).range.end
            );

            const edit = new vscode.WorkspaceEdit();
            edit.replace(fileUri, documentRange, updatedFileContents);
            await vscode.workspace.applyEdit(edit);

            await document.save();

            Logger.info(`Exported all files in ${uri.fsPath}`);
            if (!runSilent) {
              vscode.window.showInformationMessage(`${EXTENSION_NAME}: Exported all files`);
            }
          } else {
            Logger.info(`Files are identical. Nothing to be updated ${uri.fsPath}`);
          }
        }
      }
    } catch (e) {
      console.error((e as Error).message);

      Logger.error(`Sorry, something failed when exporting all modules in ${uri.fsPath}`);
      vscode.window.showErrorMessage(`${EXTENSION_NAME}: Sorry, something failed when exporting all modules in the current folder.`);
    }
  }
}
