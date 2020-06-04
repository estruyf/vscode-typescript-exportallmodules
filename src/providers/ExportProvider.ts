import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { CONFIG_KEY, CONFIG_FOLDERS } from '../constants';
import { FolderListener, ExportAll } from '../commands';
import { pathResolve } from '../helpers';

export class ExportFolder extends vscode.TreeItem {
  
  constructor( public label: string, public collapsibleState: vscode.TreeItemCollapsibleState, public value: string, public uri?: vscode.Uri, public command?: vscode.Command
  ) {
    super(label, collapsibleState);

    this.resourceUri = uri ? uri : vscode.Uri.parse(value);
    this.tooltip = value;
    this.contextValue = `uri.${value}.dir`;
    this.iconPath = vscode.ThemeIcon.Folder;
  }
}

export class ExportProvider implements vscode.TreeDataProvider<ExportFolder> {
  private _onDidChangeTreeData: vscode.EventEmitter<ExportFolder | undefined> = new vscode.EventEmitter<ExportFolder | undefined>();
  readonly onDidChangeTreeData: vscode.Event<ExportFolder | undefined> = this._onDidChangeTreeData.event;

  constructor() {}

  public getTreeItem(folder: ExportFolder): vscode.TreeItem {
    return folder;
  }

  public async getChildren(element?: ExportFolder): Promise<ExportFolder[]> {
    let config = vscode.workspace.getConfiguration(CONFIG_KEY);
    let options: string[] | undefined = config.get(CONFIG_FOLDERS);
    if (!options) {
      return [];
    }

    let folderListeners: ExportFolder[] = [];
    for (const opt of options) {
      try {
        const absPath = FolderListener.getAbsoluteFolderPath(opt);
        const folderUri = vscode.Uri.parse(absPath);
        const indexPath = path.join(absPath, 'index.ts');

        // When no `index.ts` file exists, create one
        if (!fs.existsSync(indexPath)) {
          await ExportAll.start(folderUri); 
        }

        // const fileUri = vscode.Uri.parse(indexPath);
        let fileUri = vscode.Uri.parse(`file://${pathResolve(indexPath)}`)
        if (os.platform().startsWith('win')) {
          fileUri = vscode.Uri.parse(`file:///${pathResolve(indexPath)}`.replace(/\\/g, '/'));
        }
        let command: vscode.Command = {
          command: 'exportall.open',
          title: '',
          arguments: [fileUri]
        };
        
        const config = {
          label: path.basename(folderUri.fsPath),
          collapsibleState: vscode.TreeItemCollapsibleState.None,
          value: absPath,
          uri: folderUri,
          command
        };
        const folder = new ExportFolder(config.label, config.collapsibleState, config.value, config.uri, config.command);
        folderListeners.push(folder);
      } catch {

      }
    }

    return folderListeners;
  }

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}