---
name: viator
description: 处理用户在编辑器中圈出的批注内容。当用户说“处理批注”时，自动读取本地批注数据库，修改文件代码/文本，并消除 UI 上的高亮标记。
---
   
# Viator Annotation Processing Skill

When the user asks you to "process annotations", "处理批注", or mentions "Viator annotations", use this skill to automatically retrieve the user's requested changes, apply them to the codebase/files, and mark them as resolved.

## Workflow

1. **Retrieve Pending Annotations:**
   Use the `bash` tool to run the `get.js` script to fetch annotations belonging to the current workspace.
   ```bash
   # Replace <current_workspace_path> with the absolute path to the root of the project you are working in.
   node scripts/get.js <current_workspace_path>
   ```
   *The output will be a JSON array containing `id`, `file_path`, `selection` (start/end lines), and `user_comment` (the requested change).*

2. **Process and Edit:**
   For each annotation in the JSON array:
   - Carefully read the `user_comment` and the surrounding code/text in `file_path`.
   - Use the `edit` or `write` tool to accurately apply the user's requested changes to the `file_path`.

3. **Resolve Annotations:**
   Once an edit is successfully applied, you **MUST** resolve the annotation so it disappears from the user's UI.
   Use the `bash` tool to run the `resolve.js` script with the annotation's `id`.
   ```bash
   node scripts/resolve.js <annotation_id>
   ```

## Rules
- Do NOT hallucinate paths. Strictly use the `file_path` provided in the JSON output.
- Always resolve an annotation immediately after successfully editing the corresponding file.