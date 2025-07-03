import * as vscode from "vscode";
import * as path from "path";
import * as os from "os";
import { getBarrelFiles } from "./getBarrelFiles";
import { FileOrFolderToExport } from "../models";

export function isMultiRoots(): boolean {
  const folders = vscode.workspace.workspaceFolders;

  return folders && folders.length > 1 ? true : false;
}

export function pathResolve(filePath: string) {
  if (isMultiRoots()) {
    return filePath;
  }

  const folders = vscode.workspace.workspaceFolders;
  if (folders && folders.length) {
    return path.resolve(folders[0].uri.fsPath, filePath);
  }
}

export function getWorkspaceFolder(): vscode.Uri | undefined {
  const folders = vscode.workspace.workspaceFolders;
  if (folders && folders.length) {
    return folders[0].uri;
  }
  return undefined;
}

/**
 * Retrieve the relative folder path
 * @param value
 */
export function getRelativeFolderPath(value: string): string {
  const wsFolder = getWorkspaceFolder()?.fsPath || "";
  let relativePath = value.replace(wsFolder, "");
  if (os.platform().startsWith("win")) {
    relativePath = relativePath.replace(/\\/g, "/");
  }
  return relativePath;
}

/**
 * Retrieve the absolute folder path
 * @param value
 */
export function getAbsoluteFolderPath(value: string): string {
  const wsFolder = getWorkspaceFolder()?.fsPath || "";
  return path.join(wsFolder, value);
}

/**
 * Recursively find TypeScript files in a directory
 * @param uri - The directory URI to search
 * @param rootPath - The root path for calculating relative paths
 * @param excludeFiles - Array of file patterns to exclude
 * @param excludeRel - Array of relative paths to exclude
 * @returns Array of files and folders to export
 */
export async function getFilesRecursively(
  uri: vscode.Uri,
  rootPath: string,
  excludeFiles: string[] = [],
  excludeRel: string[] = []
): Promise<FileOrFolderToExport[]> {
  const barrelFiles = getBarrelFiles();
  const filesToExport: FileOrFolderToExport[] = [];
  
  async function traverse(currentUri: vscode.Uri): Promise<void> {
    try {
      const files = await vscode.workspace.fs.readDirectory(currentUri);
      
      for (const [fileName, fileType] of files) {
        const fullPath = path.join(currentUri.fsPath, fileName);
        const relativePath = path.relative(rootPath, fullPath);
        
        // Skip if this path is in the exclusion list
        if (excludeRel.some(exclude => relativePath.toLowerCase() === exclude.toLowerCase())) {
          continue;
        }
        
        // Skip if this file matches the exclusion patterns
        if (excludeFiles.some(exclude => fileName.indexOf(exclude) !== -1)) {
          continue;
        }
        
        if (fileType === vscode.FileType.Directory) {
          // Recursively traverse subdirectories
          await traverse(vscode.Uri.file(fullPath));
        } else if (
          (fileName.endsWith(".ts") || fileName.endsWith(".tsx")) &&
          barrelFiles.indexOf(fileName.toLowerCase()) === -1
        ) {
          // This is a TypeScript file and not a barrel file
          filesToExport.push({
            name: fileName,
            relPath: relativePath,
            absPath: fullPath,
            type: "file",
          });
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }
  
  await traverse(uri);
  return filesToExport;
}
