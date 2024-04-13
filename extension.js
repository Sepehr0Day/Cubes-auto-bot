const vscode = require('vscode');
const os = require('os');

function activate(context) {
    if (os.platform() === 'win32') {
        vscode.window.showErrorMessage('Sorry, this extension is only supported on Linux.');
        return;
    }

    let disposable = vscode.commands.registerCommand('cpp-launcher.compileAndRun', function () {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor found.');
            return;
        }

        if (editor.document.languageId !== 'cpp') {
            vscode.window.showErrorMessage('This is not a C++ file.');
            return;
        }

        let filePath = editor.document.fileName;
        let fileName = filePath.split('/').pop().split('.')[0];
        let terminal = vscode.window.createTerminal({ name: 'C++ Launcher' });

        terminal.sendText(`g++ ${filePath} -o ${fileName} && clear && ./${fileName}`);
        terminal.show();
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;
