#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

// 核心存储路径（与 VS Code 插件完全一致）
function getGlobalStoragePath() {
    return path.join(os.homedir(), '.viator', 'annotations.json');
}

// 辅助函数：读取数据库
function readAnnotations() {
    const dbPath = getGlobalStoragePath();
    if (!fs.existsSync(dbPath)) return [];
    try {
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        return Array.isArray(data) ? data : [];
    } catch (e) {
        return [];
    }
}

// 辅助函数：写入数据库
function writeAnnotations(annotations) {
    const dbPath = getGlobalStoragePath();
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(annotations, null, 2), 'utf8');
}

const server = new Server(
    { name: "viator-mcp-server", version: "0.1.0" },
    { capabilities: { tools: {} } }
);

// 1. 向 AI 注册暴露的 Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "viator_get_annotations",
                description: "Get all pending AI annotations for the current workspace/project.",
                inputSchema: {
                    type: "object",
                    properties: {
                        workspace_path: {
                            type: "string",
                            description: "The absolute path of the current project workspace. The server will filter annotations belonging to files inside this directory."
                        }
                    },
                    required: ["workspace_path"]
                }
            },
            {
                name: "viator_resolve_annotation",
                description: "Mark an annotation as resolved after modifying the file. This will remove the UI highlight in the user's VS Code.",
                inputSchema: {
                    type: "object",
                    properties: {
                        annotation_id: {
                            type: "string",
                            description: "The unique ID of the annotation to resolve."
                        }
                    },
                    required: ["annotation_id"]
                }
            }
        ]
    };
});

// 2. 处理 AI 的 Tool 调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "viator_get_annotations") {
        const workspacePath = request.params.arguments.workspace_path;
        const allAnnotations = readAnnotations();
        
        // 只返回属于当前工作区的文件批注，且状态是 pending 的
        const pendingAnnotations = allAnnotations.filter(a => 
            a.status === 'pending' && a.file_path.startsWith(workspacePath)
        );

        return {
            content: [{ type: "text", text: JSON.stringify(pendingAnnotations, null, 2) }]
        };
    }

    if (request.params.name === "viator_resolve_annotation") {
        const id = request.params.arguments.annotation_id;
        const allAnnotations = readAnnotations();
        
        const updatedAnnotations = allAnnotations.map(a => {
            if (a.id === id) {
                return { ...a, status: 'resolved' };
            }
            return a;
        });
        
        // 或者直接删除： const updatedAnnotations = allAnnotations.filter(a => a.id !== id);
        
        writeAnnotations(updatedAnnotations);

        return {
            content: [{ type: "text", text: `Successfully resolved annotation: ${id}` }]
        };
    }

    throw new Error(`Tool not found: ${request.params.name}`);
});

// 启动基于 STDIO 的传输通道
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Viator MCP Server running on stdio');
}

main().catch(console.error);
