import * as vscode from 'vscode';
import { ExportAll } from './commands/ExportAll';
import { FolderListener } from './commands';
import { ExportProvider, ExportFolder } from './providers';

export function activate(context: vscode.ExtensionContext) {

	const generate = vscode.commands.registerCommand('exportall.generate', async (uri: vscode.Uri) => {
		if (uri) {
			await ExportAll.start(uri);
		} else {
			vscode.window.showErrorMessage('No folder path selected');
		}
	});

	const addListener = vscode.commands.registerCommand('exportall.addFolder', async (uri: vscode.Uri) => {
		if (uri) {
			await FolderListener.add(uri);
		} else {
			vscode.window.showErrorMessage('There was no folder path provided');
		}
	});

	const removeListener = vscode.commands.registerCommand('exportall.removeFolder', async (exportFolder: ExportFolder) => {
		if (exportFolder) {
			await FolderListener.remove(exportFolder);
		} else {
			vscode.window.showErrorMessage('There was no folder path provided');
		}
	});

	const open = vscode.commands.registerCommand('exportall.open', async function (uri: vscode.Uri) {
		await vscode.commands.executeCommand('vscode.openFolder', uri);
	});

	FolderListener.startListener();

	// Register view
	const exportView = new ExportProvider();
	vscode.window.createTreeView('exportall.view', { treeDataProvider: exportView });
	// Register view refresh
	const refresh = vscode.commands.registerCommand('exportall.refreshView', () => exportView.refresh());
	// Register the listener when configuration is changed
	vscode.workspace.onDidChangeConfiguration(() => exportView.refresh());

	context.subscriptions.push(
		generate,
		addListener,
		removeListener,
		refresh,
		open
	);

  console.log('TypeScript Export All is now active!');
}



// this method is called when your extension is deactivated
export function deactivate() {}
