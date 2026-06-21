# Viator (AI Annotator)

Viator 是一个极致优雅、**对项目零污染**的 AI 辅助批注协作工具链。

无论你是撰写网文小说，还是编写复杂的代码，Viator 都能让你像使用 Word 审阅功能一样，在编辑器中划词批注，并由底层连接的 AI Agent 瞬间理解意图、自动修改源文件，最终实现修改后高亮自动消失的丝滑体验。

## 🏗 架构总览 (Monorepo)

本项目采用 Monorepo 架构，包含三个相互独立但紧密协作的子模块：

### 1. `packages/viator-vscode/` (前端：交互 UI)
一个轻量级的 VS Code 插件。
- **零污染：** 用户的批注数据不会写入项目文件夹，而是静默存储于系统全局目录 `~/.viator/annotations.json`。
- **原生高亮：** 使用 VS Code Decorations API，在划词处渲染优雅的淡黄色高亮及悬浮气泡，绝不修改源文件字符。
- **幽灵同步：** 监听全局数据库，一旦 AI 完成修改，屏幕上的高亮会瞬间消失。

### 2. `packages/viator-mcp-server/` (后端方案 A：跨平台通用标准)
基于 Model Context Protocol (MCP) 构建的微型服务器。
- 适用于 **Cursor, Claude Desktop** 等支持 MCP 协议的 AI 客户端。
- 通过向模型暴露 `get_annotations` 和 `resolve_annotation` 两个工具，让 AI 具备读取全局隐藏批注数据的“读心术”。
- 用户可通过 `npx -y viator-mcp-server` 零配置一键挂载。

### 3. `packages/viator-skill/` (后端方案 B：OpenCode 极致轻量化引擎)
专为 **OpenCode** 打造的原生技能 (Skill)。
- 抛弃了厚重的 MCP 协议常驻监听，采用“触发式加载”。
- 只有当用户发出“处理批注”指令时，AI 才会加载 `SKILL.md`，并通过调用底层的极简 Node 脚本（`get.js` / `resolve.js`）完成数据的读取与销毁。
- **优势：** 绝对零上下文污染，Token 消耗极低。

## 🚀 快速开始

### 启动 VS Code 插件
1. 使用 VS Code 打开 `packages/viator-vscode` 目录。
2. 按 `F5` 启动调试宿主窗口。
3. 在新窗口中划选文本，使用快捷键 `Cmd+Shift+M` （或右键菜单）添加批注。

### 连接 AI 大脑 (以 OpenCode Skill 为例)
*（假设已将 `viator-skill` 注册至客户端）*
1. 在聊天框中对 Agent 发送指令：“帮我处理一下当前的 Viator 批注”。
2. Agent 将自动执行：拉取需求 -> 修改对应文件 -> 抹除批注数据。
3. 观察 VS Code 屏幕，黄色高亮瞬间消散。

## 📜 核心理念
**“把 UI 交给编辑器，把数据藏进系统，把执行交给 AI。”**