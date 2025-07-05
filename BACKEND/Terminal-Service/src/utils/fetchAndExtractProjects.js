import { supabase } from '../config/supabaseClient.js';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import fsExtra from 'fs-extra'; // Make sure installed via: npm install fs-extra

async function fetchAndExtractProject(projectId, userId) {
    try {
        const { data, error } = await supabase
            .storage
            .from('user-projects')
            .download(`${userId}/${projectId}.zip`);

        if (error) {
            console.error("❌ Error downloading zip:", error);
            return null;
        }

        const buffer = await data.arrayBuffer();
        const zip = new AdmZip(Buffer.from(buffer));

        // 🔧 Temp extraction path
        const tempExtractPath = path.join(process.cwd(), 'Projects', `${projectId}-temp`);
        fs.mkdirSync(tempExtractPath, { recursive: true });
        zip.extractAllTo(tempExtractPath, true);

        // 📁 Final destination
        const finalPath = path.join(process.cwd(), 'Projects', projectId);
        fs.mkdirSync(finalPath, { recursive: true });

        // 📦 Check if extracted folder contains single directory (like /projectId/)
        const extractedItems = fs.readdirSync(tempExtractPath);
        if (extractedItems.length === 1) {
            const innerPath = path.join(tempExtractPath, extractedItems[0]);
            const stat = fs.statSync(innerPath);
            if (stat.isDirectory()) {
                // Move contents of inner folder to finalPath
                const innerItems = fs.readdirSync(innerPath);
                for (const item of innerItems) {
                    const src = path.join(innerPath, item);
                    const dest = path.join(finalPath, item);
                    fsExtra.copySync(src, dest, { overwrite: true });
                }
            } else {
                // Single file, move directly
                const src = innerPath;
                const dest = path.join(finalPath, extractedItems[0]);
                fsExtra.copySync(src, dest, { overwrite: true });
            }
        } else {
            // Multiple files/folders directly, move all
            for (const item of extractedItems) {
                const src = path.join(tempExtractPath, item);
                const dest = path.join(finalPath, item);
                fsExtra.copySync(src, dest, { overwrite: true });
            }
        }

        // 🧹 Cleanup temp folder
        fs.rmSync(tempExtractPath, { recursive: true, force: true });

        console.log("✅ Project extracted successfully to:", finalPath);
        return finalPath;

    } catch (err) {
        console.error("❌ Exception during fetch & extract:", err);
        return null;
    }
}

export default fetchAndExtractProject;
