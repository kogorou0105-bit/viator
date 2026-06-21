const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');

let annotationDecorationType;

function getGlobalStoragePath() {
    // 核心改造：使用用户主目录下的隐藏文件夹 ~/.viator
    const viatorDir = path.join(os.homedir(), '.viator');
    if (!fs.existsSync(viatorDir)) {
        fs.mkdirSync(viatorDir, { recursive: true });
    }
    return path.join(viatorDir, 'annotations.json');
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Viator (Global Storage Version) is now active!');

    annotationDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 215, 0, 0.25)',
        borderBottom: '2px dashed rgba(255, 215, 0, 0.8)',
        overviewRulerColor: 'rgba(255, 215, 0, 0.8)',
        overviewRulerLane: vscode.OverviewRulerLane.Right
    });

    const globalJsonPath = getGlobalStoragePath();

    let disposableCommand = vscode.commands.registerCommand('viator.addAnnotation', async function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showInformationMessage('请先选中一段文字再添加批注。');
            return;
        }

        const selectedText = editor.document.getText(selection);
        // 使用绝对路径作为唯一标识
        const filePath = editor.document.uri.fsPath;

        const userComment = await vscode.window.showInputBox({
            prompt: '【AI 批注】请输入你希望 AI 如何修改这段内容',
            placeHolder: '例如：重写这部分、检查逻辑漏洞...',
            ignoreFocusOut: true
        });

        if (!userComment) return;

        const newAnnotation = {
            id: 'ai_' + Date.now(),
            timestamp: new Date().toISOString(),
            file_path: filePath,
            selection: {
                start_line: selection.start.line + 1,
                start_char: selection.start.character,
                end_line: selection.end.line + 1,
                end_char: selection.end.character,
                text: selectedText
            },
            user_comment: userComment,
            status: "pending"
        };

        let annotations = [];
        if (fs.existsSync(globalJsonPath)) {
            try {
                annotations = JSON.parse(fs.readFileSync(globalJsonPath, 'utf8'));
                if (!Array.isArray(annotations)) annotations = [];
            } catch (err) {
                console.error('JSON Parse Error:', err);
            }
        }
        annotations.push(newAnnotation);
        fs.writeFileSync(globalJsonPath, JSON.stringify(annotations, null, 2), 'utf8');

        updateDecorations(editor, globalJsonPath);
    });

    function updateDecorations(editor, jsonFilePath) {
        if (!editor) return;
        
        let annotations = [];
        if (fs.existsSync(jsonFilePath)) {
            try {
                annotations = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
            } catch (err) { return; }
        }

        const currentFilePath = editor.document.uri.fsPath;
        // 精确匹配当前打开的文件
        const activeAnnotations = annotations.filter(a => a.file_path === currentFilePath && a.status === 'pending');

        const decorationOptions = activeAnnotations.map(a => {
            const startPos = new vscode.Position(a.selection.start_line - 1, a.selection.start_char);
            const endPos = new vscode.Position(a.selection.end_line - 1, a.selection.end_char);
            
            const hoverMessage = new vscode.MarkdownString();
            hoverMessage.isTrusted = true;
            hoverMessage.appendMarkdown(`### 💬 AI 批注任务\n`);
            hoverMessage.appendMarkdown(`**要求：** <span style="background-color:#FFFBE6; color:#000000; padding:2px 4px; border-radius:3px;">${a.user_comment}</span>\n\n`);
            hoverMessage.appendMarkdown(`---\n*状态：等待 MCP Agent 处理中...*`);

            return {
                range: new vscode.Range(startPos, endPos),
                hoverMessage: hoverMessage
            };
        });

        editor.setDecorations(annotationDecorationType, decorationOptions);
    }

    // 监听文件切换
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        updateDecorations(editor, globalJsonPath);
    }));

    // 监听全局 JSON 文件的变化（当 MCP Server 修改它时，自动刷新 UI）
    const viatorDir = path.join(os.homedir(), '.viator');
    const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(viatorDir, 'annotations.json'));
    
    watcher.onDidChange(() => updateDecorations(vscode.window.activeTextEditor, globalJsonPath));
    watcher.onDidCreate(() => updateDecorations(vscode.window.activeTextEditor, globalJsonPath));
    watcher.onDidDelete(() => {
        if (vscode.window.activeTextEditor) {
            vscode.window.activeTextEditor.setDecorations(annotationDecorationType, []);
        }
    });
    
    context.subscriptions.push(watcher);

    // 初始渲染
    updateDecorations(vscode.window.activeTextEditor, globalJsonPath);
    context.subscriptions.push(disposableCommand);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}