const vscode = require('vscode');
const os = require('os');
const fs = require('fs');

const compilerConfigFile = `${os.homedir()}/cpp_launcher.json`;

function activate(context) {
    if (os.platform() === 'win32') {
        vscode.window.showErrorMessage('Sorry, this extension is only supported on Linux.');
        return;
    }

    let disposableCompileAndRun = vscode.commands.registerCommand('cpp-launcher.compileAndRun', function () {
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

        const selectedCompiler = getSelectedCompiler();
        const compilerFlags = getCompilerFlags();
        terminal.sendText(`${selectedCompiler} ${filePath} ${compilerFlags} -o ${fileName} && clear && ./${fileName}`);
        terminal.show();
    });

    let disposableSelectCompiler = vscode.commands.registerCommand('cpp-launcher.selectCompiler', function () {
        const options = ['g++', 'clang'];
        const selectedCompiler = getSelectedCompiler();
        vscode.window.showQuickPick(options, { placeHolder: 'Select C++ Compiler', ignoreFocusOut: true })
            .then(selection => {
                if (selection) {
                    setSelectedCompiler(selection);
                    vscode.window.showInformationMessage(`C++ Compiler set to ${selection}`);
                }
            });
    });

    let disposableSetCompilerFlags = vscode.commands.registerCommand('cpp-launcher.setCompilerFlags', function () {
        vscode.window.showInputBox({ placeHolder: 'Enter compiler flags (e.g., -O2 -Wall)' })
            .then(flags => {
                if (flags) {
                    setCompilerFlags(flags);
                    vscode.window.showInformationMessage('Compiler flags set successfully.');
                }
            });
    });

    let disposableResetCompilerFlags = vscode.commands.registerCommand('cpp-launcher.resetCompilerFlags', function () {
        try {
            const config = {};
            fs.writeFileSync(compilerConfigFile, JSON.stringify(config, null, 2));
            vscode.window.showInformationMessage('Compiler flags reset successfully.');
        } catch (error) {
            console.error(error);
            vscode.window.showErrorMessage('Failed to reset compiler flags.');
        }
    });

    let disposableGenerateCMakeLists = vscode.commands.registerCommand('cpp-launcher.generateCMakeLists', function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor found.');
            return;
        }

        if (editor.document.languageId !== 'cpp') {
            vscode.window.showErrorMessage('This is not a C++ file.');
            return;
        }

        const folder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
        if (!folder) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return;
        }

        const workspacePath = folder.uri.fsPath;
        fs.writeFileSync(`${workspacePath}/CMakeLists.txt`, `
        cmake_minimum_required(VERSION 3.5)
        project(MyProject)
        add_executable(${editor.document.fileName} ${editor.document.fileName})
        `);
        vscode.window.showInformationMessage('CMake successfully Created.');
    });

    let disposableStartDebugging = vscode.commands.registerCommand('cpp-launcher.startDebugging', function () {
        vscode.debug.startDebugging(vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri), {
            name: "Debug C++",
            type: "cppdbg",
            request: "launch",
            program: "${fileDirname}/${fileBasenameNoExtension}",
            args: [],
            stopAtEntry: false,
            cwd: "${workspaceFolder}",
            environment: [],
            externalConsole: false,
            MIMode: "gdb",
            setupCommands: [
                {
                    description: "Enable pretty-printing for gdb",
                    text: "-enable-pretty-printing",
                    ignoreFailures: true
                }
            ]
        });

    });

    context.subscriptions.push(disposableCompileAndRun);
    context.subscriptions.push(disposableSelectCompiler);
    context.subscriptions.push(disposableSetCompilerFlags);
    context.subscriptions.push(disposableGenerateCMakeLists);
    context.subscriptions.push(disposableStartDebugging);
    context.subscriptions.push(disposableResetCompilerFlags);

}

function getSelectedCompiler() {
    try {
        const configData = fs.readFileSync(compilerConfigFile, 'utf8');
        const config = JSON.parse(configData);
        return config.compiler || 'g++';
    } catch (error) {
        console.error(error);
        return 'g++'; 
    }
}

function setSelectedCompiler(compiler) {
    try {
        const config = { compiler };
        fs.writeFileSync(compilerConfigFile, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error(error);
    }
}

function getCompilerFlags() {
    try {
        const configData = fs.readFileSync(compilerConfigFile, 'utf8');
        const config = JSON.parse(configData);
        return config.compilerFlags || '';
    } catch (error) {
        console.error(error);
        return ''; 
    }
}

function setCompilerFlags(flags) {
    try {
        const configData = fs.readFileSync(compilerConfigFile, 'utf8');
        const config = JSON.parse(configData);
        config.compilerFlags = flags;
        fs.writeFileSync(compilerConfigFile, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error(error);
    }
}

function deactivate() { }

exports.activate = activate;
exports.deactivate = deactivate;
