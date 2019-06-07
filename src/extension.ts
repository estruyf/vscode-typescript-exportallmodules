import * as vscode from 'vscode';
import { ExportAll } from './commands/ExportAll';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('exportall.generate', async (uri: vscode.Uri) => {
		if (uri) {
			await ExportAll.start(uri);
		} else {
			vscode.window.showErrorMessage('No folder path selected');
		}
	});

	context.subscriptions.push(disposable);

  console.log('TypeScript Export All is now active!');
}

// this method is called when your extension is deactivated
export function deactivate() {}
