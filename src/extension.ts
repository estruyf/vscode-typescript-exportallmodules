import * as vscode from "vscode";
import { FolderListener, ExcludeCommand, ExportAll } from "./commands";
import { ExportProvider, ExportFolder } from "./providers";
import {
  EXTENSION_KEY,
  COMMAND_KEYS,
  getCommandName,
  EXTENSION_NAME,
} from "./constants";
import { Logger } from "./helpers/logger";
import { parse } from "path";

export function activate(context: vscode.ExtensionContext) {
  const generate = vscode.commands.registerCommand(
    getCommandName(COMMAND_KEYS.Generate),
    async (uri: vscode.Uri) => {
      if (uri) {
        await ExportAll.start(uri, false);
      } else {
        vscode.window.showErrorMessage(
          `${EXTENSION_NAME}: No folder path selected`
        );
      }
    }
  );

  const generateCurrentFile = vscode.commands.registerCommand(
    getCommandName(COMMAND_KEYS.GenerateCurrentFile),
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const { uri } = editor.document;
        const parsed = parse(uri.fsPath);
        await ExportAll.start(vscode.Uri.file(parsed.dir), false);
      } else {
        vscode.window.showErrorMessage(`${EXTENSION_NAME}: No file selected`);
      }
    }
  );

  const addListener = vscode.commands.registerCommand(
    getCommandName(COMMAND_KEYS.AddFolder),
    async (uri: vscode.Uri) => {
      if (uri) {
        await FolderListener.add(uri);
      } else {
        vscode.window.showErrorMessage(
          `${EXTENSION_NAME}: There was no folder path provided`
        );
      }
    }
  );

  const removeListener = vscode.commands.registerCommand(
    getCommandName(COMMAND_KEYS.RemoveFolder),
    async (exportFolder: ExportFolder) => {
      if (exportFolder) {
        await FolderListener.remove(exportFolder);
      } else {
        vscode.window.showErrorMessage(
          `${EXTENSION_NAME}: There was no folder path provided`
        );
      }
    }
  );

  const excludeFile = vscode.commands.registerCommand(
    getCommandName(COMMAND_KEYS.ExcludeFile),
    async (uri: vscode.Uri) => {
      if (uri) {
        await ExcludeCommand.add(uri);
      } else {
        vscode.window.showErrorMessage(
          `${EXTENSION_NAME}: There was no file path provided`
        );
      }
    }
  );

  const excludeFolder = vscode.commands.registerCommand(
    getCommandName(COMMAND_KEYS.ExcludeFolder),
    async (uri: vscode.Uri) => {
      if (uri) {
        await ExcludeCommand.add(uri);
      } else {
        vscode.window.showErrorMessage(
          `${EXTENSION_NAME}: There was no folder path provided`
        );
      }
    }
  );

  const includeFolderFile = vscode.commands.registerCommand(
    getCommandName(COMMAND_KEYS.Include),
    async (exportFolder: ExportFolder) => {
      if (exportFolder) {
        await ExcludeCommand.remove(exportFolder);
      } else {
        vscode.window.showErrorMessage(
          `${EXTENSION_NAME}: There was no folder/file path provided`
        );
      }
    }
  );

  const open = vscode.commands.registerCommand(
    getCommandName(COMMAND_KEYS.Open),
    async function (uri: vscode.Uri) {
      await vscode.commands.executeCommand("vscode.openFolder", uri);
    }
  );

  FolderListener.startListener();

  // Register view
  const exportView = new ExportProvider();
  vscode.window.createTreeView(`${EXTENSION_KEY}.view`, {
    treeDataProvider: exportView,
  });
  // Register view refresh
  const refresh = vscode.commands.registerCommand(
    getCommandName(COMMAND_KEYS.RefreshView),
    () => exportView.refresh()
  );
  // Register the listener when configuration is changed
  vscode.workspace.onDidChangeConfiguration(() => exportView.refresh());

  context.subscriptions.push(
    generate,
    generateCurrentFile,
    addListener,
    removeListener,
    refresh,
    open,
    excludeFile,
    excludeFolder,
    includeFolderFile
  );

  Logger.info("TypeScript Barrel Generator is now active!");
}

// this method is called when your extension is deactivated
export function deactivate() {}
