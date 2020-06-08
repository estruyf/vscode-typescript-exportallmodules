import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getSettingName, CONFIG_EXCLUDE, CONFIG_INCLUDE_FOLDERS, CONFIG_RELATIVE_EXCLUDE } from '../constants';
import { getRelativeFolderPath } from '../helpers';

export class ExportAll {
  
  public static async start(uri: vscode.Uri, runSilent: boolean = true) {
    try {
      const excludeFiles: string | undefined = vscode.workspace.getConfiguration().get(getSettingName(CONFIG_EXCLUDE));
      const excludeRel: string | undefined = vscode.workspace.getConfiguration().get(getSettingName(CONFIG_RELATIVE_EXCLUDE));
      const includeFolders: boolean | undefined = vscode.workspace.getConfiguration().get(getSettingName(CONFIG_INCLUDE_FOLDERS));

      const folderPath = uri.fsPath;
      const files = fs.readdirSync(folderPath);
      let filesToExport: string[] = [];
      
      if (files && files.length > 0) {
        for (const file of files) {
          const absPath = path.join(folderPath, file);
          let include = false;
          let relPath = file;

          // Include all TS files except for the index
          if ((file.endsWith(".ts") || file.endsWith(".tsx")) && file.toLowerCase() !== "index.ts") {
            relPath = getRelativeFolderPath(absPath);
            include = true;
          }

          // Check if folders should be included
          if (includeFolders) {
            // Only allow folder which contain an index file
            if (fs.lstatSync(absPath).isDirectory()) {
              const indexPath = path.join(absPath, '/index.ts');
              if (fs.existsSync(indexPath)) {
                relPath = getRelativeFolderPath(absPath);
                include = true;
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
            filesToExport.push(file);
          }
        }        
      }

      // Check if there are still files after the filter
      if (filesToExport && filesToExport.length > 0) {
        let output = filesToExport.map((file) => {
          const fileWithoutExtension = path.parse(file).name;
          return `export * from './${fileWithoutExtension}';\n`;
        });

        if (output && output.length > 0) {
          fs.writeFileSync(path.join(uri.fsPath, "index.ts"), output.join(""));
          if (!runSilent) {
            vscode.window.showInformationMessage("TypeScript: Exported all files");
          }
        }
      }
    } catch (e) {
      console.error(e.message);
      vscode.window.showErrorMessage("Sorry, something failed when exporting all modules in the current folder.");
    }
  }
}