import * as vscode from 'vscode';
import * as path from 'path';
import { ExportAll } from '.';
import { CONFIG_KEY, CONFIG_FOLDERS } from '../constants';
import { ExportFolder } from '../providers';

export class FolderListener {
  private static watchers: { [path: string]: vscode.FileSystemWatcher } = {};

  /**
   * Add a new listener 
   * @param uri 
   */
  public static async add(uri: vscode.Uri) {
    const relativePath = this.getRelativeFolderPath(uri.path);
    let options = this.getFolders();
    options.push(relativePath);
    options = [...new Set(options)];
    this.updateFolders(options);
    this.startListener();
  }
  
  /**
   * Remove a listener
   * @param uri 
   */
  public static async remove(exportFolder: ExportFolder) {
    const relativePath = this.getRelativeFolderPath(exportFolder.value);
    let options = this.getFolders();
    options = options.filter(p => p !== relativePath);
    options = [...new Set(options)];
    this.updateFolders(options);
    this.startListener();
  }

  /**
   * Start the listener
   */
  public static async startListener() {
    const folderListener: string[] | undefined = vscode.workspace.getConfiguration(CONFIG_KEY).get(CONFIG_FOLDERS);

    // Dispose all the current watchers
    const paths = Object.keys(this.watchers);
    for (const path of paths) {
      const watcher = this.watchers[path];
      watcher.dispose();
      delete this.watchers[path];
    }

    // Recreate all the watchers
    if (folderListener) {
      for (const folder of folderListener) {
        const absFolder = this.getAbsoluteFolderPath(folder);
        const folderUri = vscode.Uri.parse(absFolder);
        let watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(absFolder, "*"));
        watcher.onDidDelete(async (uri: vscode.Uri) => this.listener(folderUri, uri));
        watcher.onDidCreate(async (uri: vscode.Uri) => this.listener(folderUri, uri));
        watcher.onDidChange(async (uri: vscode.Uri) => this.listener(folderUri, uri));
        this.watchers[folderUri.path] = watcher;
      }
    }
  }

  /**
   * Retrieve the absolute folder path
   * @param value 
   */
  public static getAbsoluteFolderPath(value: string): string {
    const wsFolder = vscode.workspace.rootPath || "";
    return path.join(wsFolder, value);
  }

  /**
   * Listener logic
   * @param uri 
   */
  private static async listener(folderUri: vscode.Uri, uri: vscode.Uri) {
    if (!this.isIndexFile(uri)) {
      await ExportAll.start(folderUri);
    } 
  }

  /**
   * Get the current set folders
   */
  private static getFolders() {
    let config = vscode.workspace.getConfiguration(CONFIG_KEY);
    let options: string[] | undefined = config.get(CONFIG_FOLDERS);
    if (!options) {
      options = [];
    }
    return options;
  }

  /**
   * Update the folder settings
   */
  private static updateFolders(options: string[]) {
    let config = vscode.workspace.getConfiguration(CONFIG_KEY);
    config.update(CONFIG_FOLDERS, options);
  }

  /**
   * Check if the path ends with `index.ts`
   * @param uri 
   */
  private static isIndexFile(uri: vscode.Uri) {
    return uri.path.toLowerCase().endsWith("index.ts");
  }

  /**
   * Retrieve the relative folder path
   * @param value 
   */
  private static getRelativeFolderPath(value: string): string {
    const wsFolder =  vscode.workspace.rootPath || "";
    return value.replace(wsFolder, "");
  }
}