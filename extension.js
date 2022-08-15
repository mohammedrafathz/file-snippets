const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate() {
	let folders = vscode.workspace.workspaceFolders;

	if (folders) {
		let watcher = vscode.workspace.createFileSystemWatcher(
			new vscode.RelativePattern(folders[0], "fs-*"));

		watcher.onDidCreate(async uri => {
			const wsedit = new vscode.WorkspaceEdit();
			const snippetsArray = JSON.parse(fs.readFileSync(path.join(__dirname, "snippets.json"), 'utf8'));
			const arr = uri.path.split("/");
			const newFilename = arr.pop().split("-");
			const selectedSnippet = newFilename[1];
			const filename = newFilename[2];
			let selectedTemplate = '';

			snippetsArray.map(s => {
				if (s.name === selectedSnippet) {
					selectedTemplate = s.template.join('\n')
						.replaceAll("{filename}", filename.split(".")[0])
				}
			})
			arr.push(filename);

			const newUri = vscode.Uri.file(arr.join('/'));

			await vscode.workspace.fs.rename(uri, newUri);

			wsedit.insert(newUri, new vscode.Position(0, 0), selectedTemplate)
			
			await vscode.workspace.applyEdit(wsedit);
		});
	}
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
