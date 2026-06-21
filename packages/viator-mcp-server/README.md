# Viator MCP Server

This is the backend Model Context Protocol (MCP) server for the **Viator** toolchain. It acts as a bridge between your AI Assistant (like Cursor or Claude Desktop) and your local Viator annotations.

## 🌟 What it does

When you use the Viator VS Code extension to annotate your code, the data is saved in a hidden global folder (`~/.viator/annotations.json`). 

This MCP server exposes two standard tools to your AI, giving it "telepathy" to read those hidden annotations:
- `viator_get_annotations`: Allows the AI to fetch all pending tasks for the current workspace.
- `viator_resolve_annotation`: Allows the AI to mark a task as done, which instantly removes the UI highlight in your VS Code.

## 🚀 Installation & Configuration

You do **NOT** need to globally install this package. You can configure your AI client to run it on-demand via `npx`.

### For Cursor IDE
1. Open Cursor Settings -> Features -> MCP.
2. Click **+ Add New MCP Server**.
3. Type: `command`
4. Name: `viator`
5. Command: `npx`
6. Args: `-y viator-mcp-server@latest`

### For Claude Desktop
Add the following to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "viator": {
      "command": "npx",
      "args": ["-y", "viator-mcp-server@latest"]
    }
  }
}
```

## 🪄 How to use

Once configured, simply tell your AI:
> *"Process my Viator annotations."*

The AI will automatically discover the tools, read your annotations, edit your files, and resolve the tasks.