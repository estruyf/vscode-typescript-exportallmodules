import * as vscode from "vscode";
import { EXTENSION_NAME, EXTENSION_KEY, CONFIG_FOLDERS } from "../constants";
import {
  clearWildcard,
  fileExists,
  getAbsoluteFolderPath,
  getBarrelFiles,
  getFileContents,
  getFilesRecursively,
  getRelativeFolderPath,
  parseFileForNamedExports,
  parseWinPath,
  writeFile,
} from "../helpers";
import { Logger } from "../helpers/logger";
import { join, parse } from "path";
import { getConfig } from "../helpers/getConfig";
import { FileOrFolderToExport } from "../models";

export class ExportAll {
  public static async start(crntUri: vscode.Uri, runSilent: boolean = true) {
    const uri = vscode.Uri.file(clearWildcard(parseWinPath(crntUri.fsPath)));

    try {
      const {
        excludeFiles,
        excludeRel,
        includeFolders,
        message,
        namedExports,
        quote,
        semis,
        fileExtension,
        barrelName,
        exportFullPath,
        recursive,
      } = getConfig();

      const BarrelFiles = getBarrelFiles();
      const folderPath = uri.fsPath;
      let filesToExport: FileOrFolderToExport[] = [];

      if (recursive) {
        // Use recursive search
        filesToExport = await getFilesRecursively(
          uri,
          folderPath,
          excludeFiles as string[],
          excludeRel as string[]
        );
      } else {
        // Use original non-recursive logic
        const files = await vscode.workspace.fs.readDirectory(uri);

        if (files && files.length > 0) {
          for (const [file] of files) {
            const absPath = join(folderPath, file);
            let include = false;
            let relPath = file;
            let crntAbsPath = absPath;

            // Include all TS files except for the index
            if (
              (file.endsWith(".ts") || file.endsWith(".tsx")) &&
              BarrelFiles.indexOf(file.toLowerCase()) === -1
            ) {
              relPath = getRelativeFolderPath(absPath);
              include = true;
            }

            // Check if folders should be included
            if (includeFolders) {
              // Only allow folder which contain an index file
              const stat = await vscode.workspace.fs.stat(
                vscode.Uri.file(absPath)
              );
              if (stat.type === vscode.FileType.Directory) {
                for (const indexFile of BarrelFiles) {
                  const indexPath = join(absPath, indexFile);
                  if (await fileExists(indexPath)) {
                    relPath = getRelativeFolderPath(absPath);
                    crntAbsPath = indexPath;
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
                const stat = await vscode.workspace.fs.stat(
                  vscode.Uri.file(absPath)
                );
                filesToExport.push({
                  name: file,
                  relPath: relPath,
                  absPath: crntAbsPath,
                  type:
                    stat.type === vscode.FileType.Directory ? "folder" : "file",
                });
              } catch (ex) {
                // Ignore
              }
            }
          }
        }
      }

      // Check if there are still files after the filter
      if (filesToExport && filesToExport.length > 0) {
        const output: string[] = [];

        for (const item of filesToExport) {
          let fileWithoutExtension: string;
          let relativePath: string;

          if (recursive && item.type === "file") {
            // For recursive files, use the relative path from the root folder
            const normalizedPath = item.relPath.replace(/\\/g, "/"); // Normalize path separators
            fileWithoutExtension = normalizedPath.replace(/\.[^/.]+$/, ""); // Remove extension
            relativePath = `./${fileWithoutExtension}`;
          } else {
            // Original logic for non-recursive
            fileWithoutExtension =
              item.type === "folder" ? item.name : parse(item.name).name;
            relativePath = `./${fileWithoutExtension}`;

            if (item.type === "folder" && exportFullPath) {
              fileWithoutExtension = item.absPath.replace(folderPath, "");
              if (fileWithoutExtension.startsWith("/")) {
                fileWithoutExtension = fileWithoutExtension.substring(1);
              }
              const ext = parse(fileWithoutExtension).ext;
              fileWithoutExtension = fileWithoutExtension.replace(ext, "");
              relativePath = `./${fileWithoutExtension}`;
            }
          }

          let fileSuffix = "";
          if (fileExtension && (item.type === "file" || exportFullPath)) {
            fileSuffix = fileExtension.startsWith(`.`)
              ? fileExtension
              : `.${fileExtension}`;
          }

          if (namedExports) {
            const filePath = item.absPath;
            const fileContents = await getFileContents(filePath);
            const { namedExports, typeExports } = parseFileForNamedExports(
              fileContents || "",
              parse(item.name).name
            );

            const namedExportsStr = namedExports.filter(Boolean).join(", ");
            const typeExportsStr = typeExports.filter(Boolean).join(", ");
            let exportStr = "";
            if (namedExportsStr) {
              exportStr += `export { ${namedExportsStr} } from ${quote}${relativePath}${fileSuffix}${quote}${
                semis ? ";" : ""
              }\n`;
            }
            if (typeExportsStr) {
              exportStr += `export type { ${typeExportsStr} } from ${quote}${relativePath}${fileSuffix}${quote}${
                semis ? ";" : ""
              }\n`;
            }
            output.push(exportStr);
          } else {
            output.push(
              `export * from ${quote}${relativePath}${fileSuffix}${quote}${
                semis ? ";" : ""
              }\n`
            );
          }
        }

        if (output && output.length > 0) {
          const filePath = join(uri.fsPath, barrelName || "index.ts");
          if (!(await fileExists(filePath))) {
            await writeFile(filePath, "");
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
      Logger.error(
        `Sorry, something failed when exporting all modules in ${uri.fsPath}`
      );
      Logger.error((e as Error).message);
      vscode.window.showErrorMessage(
        `${EXTENSION_NAME}: Sorry, something failed when exporting all modules in the current folder.`
      );
    }
  }
}
