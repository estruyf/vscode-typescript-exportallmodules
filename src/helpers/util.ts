import * as vscode from 'vscode';
import * as path from 'path';

export function isMultiRoots(): boolean {
  const folders = vscode.workspace.workspaceFolders;

  return (folders && folders.length > 1) ? true : false;
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