const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../src');
const destDir = path.join(__dirname, '../dist');

copyDir(sourceDir, destDir);

async function copyDir(source, target) {
    try {
        await fs.promises.mkdir(target, { recursive: true });
        const entries = await fs.promises.readdir(source, {
            withFileTypes: true
        });

        await Promise.all(
            entries.map(async (entry) => {
                const srcPath = path.join(source, entry.name);
                const destPath = path.join(target, entry.name);

                if (entry.isDirectory()) {
                    await copyDir(srcPath, destPath);
                } else {
                    await fs.promises.copyFile(srcPath, destPath);
                    console.log(`Copied: ${srcPath} -> ${destPath}`);
                }
            })
        );

        console.log(`Successfully copied ${source} to ${target}`);
    } catch (error) {
        console.error(`Error copying ${source}:`, error);
    }
}
