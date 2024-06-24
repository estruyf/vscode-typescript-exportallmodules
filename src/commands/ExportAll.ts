import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import {
  CONFIG_EXCLUDE,
  CONFIG_INCLUDE_FOLDERS,
  CONFIG_RELATIVE_EXCLUDE,
  CONFIG_SEMIS,
  CONFIG_QUOTE,
  EXTENSION_NAME,
  CONFIG_MESSAGE,
  EXTENSION_KEY,
  CONFIG_FOLDERS,
  CONFIG_NAMED_EXPORTS,
} from "../constants";
import {
  clearWildcard,
  getAbsoluteFolderPath,
  getRelativeFolderPath,
  parseFileForNamedExports,
  parseWinPath,
} from "../helpers";
import { Logger } from "../helpers/logger";

interface FileOrFolderToExport {
  name: string;
  type: "file" | "folder";
}

export class ExportAll {
  public static barrelFiles = ["index.ts", "index.tsx"];

  public static async start(crntUri: vscode.Uri, runSilent: boolean = true) {
    const uri = vscode.Uri.file(clearWildcard(parseWinPath(crntUri.fsPath)));

    try {
      const config = vscode.workspace.getConfiguration(EXTENSION_KEY);
      const excludeFiles: string | undefined = config.get(CONFIG_EXCLUDE);
      const excludeRel: string | undefined = config.get(
        CONFIG_RELATIVE_EXCLUDE
      );
      const includeFolders: boolean | undefined = config.get(
        CONFIG_INCLUDE_FOLDERS
      );
      const namedExports: boolean | undefined = config.get(CONFIG_NAMED_EXPORTS);
      const semis: boolean | undefined = config.get(CONFIG_SEMIS);
      const quote: '"' | "'" = config.get(CONFIG_QUOTE) ?? "'";
      const message: string | string[] | undefined = config.get<
        string | string[]
      >(CONFIG_MESSAGE);

      const folderPath = uri.fsPath;
      const files = fs.readdirSync(folderPath);
      let filesToExport: FileOrFolderToExport[] = [];

      if (files && files.length > 0) {
        for (const file of files) {
          const absPath = path.join(folderPath, file);
          let include = false;
          let relPath = file;

          // Include all TS files except for the index
          if (
            (file.endsWith(".ts") || file.endsWith(".tsx")) &&
            this.barrelFiles.indexOf(file.toLowerCase()) === -1
          ) {
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
                type: fs.statSync(absPath).isDirectory() ? "folder" : "file",
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
          const fileWithoutExtension =
            item.type === "folder" ? item.name : path.parse(item.name).name;
          if (namedExports) {
            const filePath = path.join(uri.fsPath, item.name);
            const fileContents = fs.readFileSync(filePath, 'utf8');
            const { namedExports, typeExports } = parseFileForNamedExports(fileContents);

            const namedExportsStr = namedExports.filter(Boolean).join(', ');
            const typeExportsStr = typeExports.filter(Boolean).map(typeExport => `type ${typeExport}`).join(', ');
            if (!namedExportsStr && !typeExportsStr) {
              return '';
            }
            return `export { ${namedExportsStr}${typeExportsStr ? `, ${typeExportsStr}` : ''} } from ${quote}./${fileWithoutExtension}${quote}${semis ? ";" : ""}\n`;
          } else {
            return `export * from ${quote}./${fileWithoutExtension}${quote}${semis ? ";" : ""}\n`;
          }
        });

        if (output && output.length > 0) {
          const filePath = path.join(uri.fsPath, "index.ts");
          if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, "");
          }

          const fileUri = vscode.Uri.file(filePath);
          const document = await vscode.workspace.openTextDocument(fileUri);

          // Check if the banner message needs to be added
          if (message) {
            output.unshift(`\n`);
            output.unshift(`// ${message}\n`);
          }

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
              vscode.window.showInformationMessage(
                `${EXTENSION_NAME}: Exported all files`
              );
            }
          } else {
            Logger.info(
              `Files are identical. Nothing to be updated ${uri.fsPath}`
            );
          }
        }
      }

      if (runSilent) {
        let folderListener: string[] | undefined = vscode.workspace
          .getConfiguration(EXTENSION_KEY)
          .get(CONFIG_FOLDERS);

        folderListener = (folderListener || []).map((folder) => {
          let absFolder = getAbsoluteFolderPath(folder);
          return clearWildcard(absFolder);
        });

        const matchingFolders = folderListener.filter((folder) =>
          uri.fsPath.includes(folder)
        );

        if (matchingFolders.length > 0) {
          for (let folder of matchingFolders) {
            if (parseWinPath(folder) !== parseWinPath(uri.fsPath)) {
              Logger.info(`Exporting files from ${folder}`);

              const folderUri = vscode.Uri.file(folder);
              await ExportAll.start(folderUri);
            }
          }
        }
      }
    } catch (e) {
      console.error((e as Error).message);

      Logger.error(
        `Sorry, something failed when exporting all modules in ${uri.fsPath}`
      );
      vscode.window.showErrorMessage(
        `${EXTENSION_NAME}: Sorry, something failed when exporting all modules in the current folder.`
      );
    }
  }
}
