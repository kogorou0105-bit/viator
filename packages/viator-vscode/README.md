# Viator AI Annotator (VS Code Extension)

This is the front-end user interface for the **Viator** toolchain. It allows you to seamlessly add AI annotations to your codebase or documents without polluting your project files.

## ✨ Features

- **Zero Project Pollution:** Annotations are NOT saved in your workspace. They are silently stored in a global system directory (`~/.viator/annotations.json`).
- **Elegant UI:** Uses VS Code's native Decorations API. Your selected text receives a subtle yellow highlight with a beautiful markdown hover card showing your annotation.
- **Ghost Sync:** A file watcher listens to the global database. Once your AI Agent processes and resolves the annotation, the yellow highlight instantly vanishes from your screen.

## 🚀 Usage

1. Select any text in your editor.
2. Press `Cmd + Shift + M` (Mac) or `Ctrl + Shift + M` (Windows), OR right-click and select **"Viator: Add AI Annotation"**.
3. Type your instructions for the AI (e.g., "Refactor this function to be more efficient", "Rewrite this paragraph").
4. Press Enter. The text will highlight, and the task is queued.

## 🤖 AI Integration

This extension is just the UI. To magically resolve these annotations, you need to connect your AI assistant (like Cursor, Claude Desktop, or OpenCode) to the Viator database.

You can do this by:
1. Installing the **Viator MCP Server** (`npx -y viator-mcp-server`) in your AI client.
2. Or using the **Viator OpenCode Skill**.

See the main repository README for complete setup instructions.