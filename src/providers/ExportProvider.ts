import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { EXTENSION_KEY, CONFIG_FOLDERS, CONFIG_RELATIVE_EXCLUDE } from '../constants';
import { ExportAll } from '../commands';
import { pathResolve, getAbsoluteFolderPath } from '../helpers';

export class ExportFolder extends vscode.TreeItem {
  
  constructor(public label: string, public value: string | null, public uri?: vscode.Uri | null, command?: vscode.Command | null, public iconPath?: string | vscode.ThemeIcon, public contextValue?: string, public children?: vscode.TreeItem[]) {
    super(label, children ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None);

    if (command) {
      this.command = command;
    }

    if (value) {
      this.resourceUri = uri ? uri : vscode.Uri.file(value);
      this.tooltip = value;
    }
  }
}

export class ExportProvider implements vscode.TreeDataProvider<ExportFolder> {
  private _onDidChangeTreeData: vscode.EventEmitter<ExportFolder | undefined> = new vscode.EventEmitter<ExportFolder | undefined>();
  readonly onDidChangeTreeData: vscode.Event<ExportFolder | undefined> = this._onDidChangeTreeData.event;

  constructor() {
    console.log('Refresh');
  }

  public getTreeItem(folder: ExportFolder): vscode.TreeItem {
    return folder;
  }

  /**
   * Retrieve the children to show in the tree view
   * @param element 
   */
  public async getChildren(element?: ExportFolder): Promise<ExportFolder[]> {
    if (element && element.children) {
      return element.children as ExportFolder[];
    }

    let config = vscode.workspace.getConfiguration(EXTENSION_KEY);
    let listenerOptions: string[] = config.get(CONFIG_FOLDERS) || [];
    let excludeOptions: string[] = config.get(CONFIG_RELATIVE_EXCLUDE) || [];

    const exportListeners = await this.getExportItems(listenerOptions);
    const excludeList = await this.getExportItems(excludeOptions, true);

    return [
      new ExportFolder(`Folder listeners`, null, null, null, '', 'exportall.header', [
        ...exportListeners
      ]),
      new ExportFolder(`Excluded folders & files`, null, null, null, '', 'exportall.header', [
        ...excludeList
      ])
    ];
  }

  /**
   * Refresh the tree view
   */
  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Get all the items for the tree view
   * @param options 
   */
  public async getExportItems(options: string[], skipIndexCheck: boolean = false) {
    let items: ExportFolder[] = [];
    for (const opt of options) {
      try {
        const absPath = getAbsoluteFolderPath(opt);
        const isFolder = fs.lstatSync(absPath).isDirectory();
        const uri = vscode.Uri.file(absPath);
        const indexPath = path.join(absPath, 'index.ts');

        // When no `index.ts` file exists, create one
        if (!skipIndexCheck) {
          if (!fs.existsSync(indexPath)) {
            await ExportAll.start(uri); 
          }
        }

        // Generate the path for the open command
        const filePath = isFolder ? pathResolve(indexPath) : absPath;
        let fileUri = vscode.Uri.file(`file://${filePath}`);

        // Create the open command
        let command: vscode.Command = {
          command: 'exportall.open',
          title: '',
          arguments: [fileUri]
        };
        
        const config = {
          label: path.basename(uri.fsPath),
          value: absPath,
          uri: uri,
          command,
          iconPath: isFolder ? vscode.ThemeIcon.Folder : vscode.ThemeIcon.File,
          contextValue: skipIndexCheck ? "exportall.excluded" : "exportall.listener"
        };
        const folder = new ExportFolder(config.label, config.value, config.uri, config.command, config.iconPath, config.contextValue);
        items.push(folder);
      } catch {

      }
    }
    return items;
  }
}