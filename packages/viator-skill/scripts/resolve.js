const fs = require('fs');
const path = require('path');
const os = require('os');

function getGlobalStoragePath() {
    return path.join(os.homedir(), '.viator', 'annotations.json');
}

function main() {
    const annotationId = process.argv[2];
    if (!annotationId) {
        console.error("Usage: node resolve.js <annotation_id>");
        process.exit(1);
    }

    const dbPath = getGlobalStoragePath();
    if (!fs.existsSync(dbPath)) {
        console.log(`Annotation ${annotationId} not found (db empty).`);
        return;
    }

    try {
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        if (!Array.isArray(data)) return;

        let found = false;
        const updatedData = data.map(a => {
            if (a.id === annotationId) {
                found = true;
                return { ...a, status: 'resolved' };
            }
            return a;
        });

        if (found) {
            fs.writeFileSync(dbPath, JSON.stringify(updatedData, null, 2), 'utf8');
            console.log(`Successfully resolved annotation: ${annotationId}`);
        } else {
            console.log(`Annotation ${annotationId} not found in db.`);
        }

    } catch (e) {
        console.error("Error updating annotations database:", e);
        process.exit(1);
    }
}

main();
