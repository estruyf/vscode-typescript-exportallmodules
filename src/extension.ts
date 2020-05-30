import * as vscode from 'vscode';
import { ExportAll } from './commands/ExportAll';

const CONFIG_KEY = 'exportall';
const CONFIG_FOLDERS = 'config.folderListener';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('exportall.generate', async (uri: vscode.Uri) => {
		if (uri) {
			await ExportAll.start(uri);
		} else {
			vscode.window.showErrorMessage('No folder path selected');
		}
	});

	let addProjectListener = vscode.commands.registerCommand('exportall.addFolder', async (uri: vscode.Uri) => {
		if (uri) {
			let config = vscode.workspace.getConfiguration(CONFIG_KEY)
			let options: string[] | undefined = config.get(CONFIG_FOLDERS);
			if (!options) {
				options = [];
			}
			options.push(uri.path);
			options = [...new Set(options)];
			config.update(CONFIG_FOLDERS, options);
			startListener();
		} else {
			vscode.window.showErrorMessage('No folder path selected');
		}
	});

	startListener();

	context.subscriptions.push(disposable);
	context.subscriptions.push(addProjectListener);

  console.log('TypeScript Export All is now active!');
}

const startListener = () => {
	const folderListener: string[] | undefined = vscode.workspace.getConfiguration(CONFIG_KEY).get(CONFIG_FOLDERS);
	if (folderListener) {
		for (const folder of folderListener) {
			let watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(folder, "*"));
			const folderUri = vscode.Uri.file(folder);
			watcher.onDidDelete(async (uri: vscode.Uri) => {
				await ExportAll.start(folderUri);
			});
			watcher.onDidCreate(async (uri: vscode.Uri) => {
				await ExportAll.start(folderUri);
			});
		}
	}
}

// this method is called when your extension is deactivated
export function deactivate() {}
