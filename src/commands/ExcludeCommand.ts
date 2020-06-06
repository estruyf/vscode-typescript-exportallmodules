import * as vscode from 'vscode';
import { getRelativeFolderPath, getAbsoluteFolderPath } from '../helpers';
import { FolderListener } from './FolderListener';
import { EXTENSION_KEY, CONFIG_RELATIVE_EXCLUDE, CONFIG_FOLDERS } from '../constants';
import { ExportFolder } from '../providers';
import { ExportAll } from '.';

export class ExcludeCommand {

  /**
   * Add path to the exclusion list
   * @param uri 
   */
  public static async add(uri: vscode.Uri) {
    let relativePath = getRelativeFolderPath(uri.fsPath);
    let options = this.getOptions();
    options.push(relativePath);
    options = [...new Set(options)];
    await this.update(options);
    this.updateExports();
  }

  /**
   * Remove the path from the exclusion list
   * @param uri 
   */
  public static async remove(exportFolder: ExportFolder) {
    if (exportFolder.value) {
      const relativePath = getRelativeFolderPath(exportFolder.value);
      let options = this.getOptions();
      options = options.filter(p => p !== relativePath);
      options = [...new Set(options)];
      await this.update(options);
      this.updateExports();
    }
  }

  /**
   * Get the current set folders
   */
  private static getOptions() {
    let config = vscode.workspace.getConfiguration(EXTENSION_KEY);
    let options: string[] | undefined = config.get(CONFIG_RELATIVE_EXCLUDE);
    if (!options) {
      options = [];
    }
    return options;
  }

  /**
   * Update the folder settings
   */
  private static async update(options: string[]) {
    let config = vscode.workspace.getConfiguration(EXTENSION_KEY);
    await config.update(CONFIG_RELATIVE_EXCLUDE, options);
  }

  /**
   * Do a new export of the folders
   */
  private static updateExports() {
    const folderListener: string[] | undefined = vscode.workspace.getConfiguration(EXTENSION_KEY).get(CONFIG_FOLDERS);
    if (folderListener) {
      for (const folder of folderListener) {
        const absFolder = getAbsoluteFolderPath(folder);
        const folderUri = vscode.Uri.parse(absFolder);
        ExportAll.start(folderUri);
      }
    }
  }
}