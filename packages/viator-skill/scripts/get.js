const fs = require('fs');
const path = require('path');
const os = require('os');

function getGlobalStoragePath() {
    return path.join(os.homedir(), '.viator', 'annotations.json');
}

function main() {
    const workspacePath = process.argv[2];
    if (!workspacePath) {
        console.error("Usage: node get.js <workspace_absolute_path>");
        process.exit(1);
    }

    const dbPath = getGlobalStoragePath();
    if (!fs.existsSync(dbPath)) {
        console.log(JSON.stringify([]));
        return;
    }

    try {
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        if (!Array.isArray(data)) {
            console.log(JSON.stringify([]));
            return;
        }

        // Filter annotations by workspace path and pending status
        const pendingAnnotations = data.filter(a => 
            a.status === 'pending' && a.file_path.startsWith(workspacePath)
        );

        // Output pure JSON for the LLM to parse
        console.log(JSON.stringify(pendingAnnotations, null, 2));
    } catch (e) {
        console.error("Error reading annotations database:", e);
        process.exit(1);
    }
}

main();
