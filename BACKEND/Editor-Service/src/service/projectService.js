import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import { exec } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import util from 'util';
import 'dotenv/config';
import directoryTree from 'directory-tree';
import AdmZip from 'adm-zip'
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE } from '../config/serverconfig.js';

const execPromisified = util.promisify(exec);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// ✅ Add this at the top
const zipFolder = async (sourceFolder, outPath) => {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const { createWriteStream } = await import('fs');
  const stream = createWriteStream(outPath);

  return new Promise((resolve, reject) => {
    archive.directory(sourceFolder, false).on('error', err => reject(err)).pipe(stream);
    stream.on('close', () => resolve());
    archive.finalize();
  });
};


export const createProjectService = async (userId) => {
  const projectId = uuidv4();
  const outerFolderPath = `Projects/${projectId}`;
  const innerFolderPath = path.join(outerFolderPath, 'sandbox'); // 👈 actual project folder

  console.log("New project:", projectId);
  await fs.mkdir(outerFolderPath);

  // 1️⃣ Generate Vite project inside sandbox
  await execPromisified(`npm create vite@latest sandbox -- --template react`, {
    cwd: outerFolderPath,
  });

  // 2️⃣ Zip the inner sandbox folder
  const zipPath = `Projects/${projectId}.zip`;
  await zipFolder(innerFolderPath, zipPath); // 👈 zip only sandbox

  // 3️⃣ Upload to Supabase
  const fileBuffer = await fs.readFile(zipPath);
  console.log("Uploading project for user:", userId);
  const { error: uploadError } = await supabase.storage
    .from('user-projects')
    .upload(`${userId}/${projectId}.zip`, fileBuffer, {
      contentType: 'application/zip',
      upsert: true,
    });

  if (uploadError) {
    console.error("Supabase Upload Error:", uploadError);
    throw uploadError;
  }

  // 4️⃣ Save project metadata to Supabase table
  const { error: insertError } = await supabase
    .from('projects')
    .insert([
      {
        id: projectId,
        name: 'Untitled Project',
        user_id: userId,
      },
    ]);

  if (insertError) {
    console.error("Supabase DB Insert Error:", insertError);
    throw insertError;
  }

  return projectId;
};



export const getProjectTreeService = async (projectId, userId) => {
  const folderPath = path.resolve(`Projects/${projectId}`);
  const sandboxPath = path.join(folderPath, 'sandbox');
  const zipPath = path.resolve(`Projects/${projectId}.zip`);

  try {
    const sandboxExists = await fs.access(sandboxPath).then(() => true).catch(() => false);

    if (!sandboxExists) {
      console.log(`[Service] Sandbox for ${projectId} missing. Attempting ZIP download...`);

      const { data, error } = await supabase
        .storage
        .from('user-projects')
        .download(`${userId}/${projectId}.zip`);

      if (error || !data) {
        console.error("⚠️ Supabase download failed:", error);
        throw new Error("Could not fetch ZIP from Supabase Storage");
      }

      const buffer = Buffer.from(await data.arrayBuffer());
      await fs.mkdir(folderPath, { recursive: true }); // ✅ in case parent folder was missing
      await fs.writeFile(zipPath, buffer);

      const zip = new AdmZip(zipPath);
      zip.extractAllTo(folderPath, true);
      console.log(`[Service] ZIP extracted to ${folderPath}`);

      // Optional: delete zip after extraction
      await fs.unlink(zipPath).catch(() => {});
    }

    // Final check: is sandbox there now?
    const finalCheck = await fs.access(sandboxPath).then(() => true).catch(() => false);
    if (!finalCheck) {
      throw new Error("Sandbox folder missing after extraction");
    }

    const tree = directoryTree(sandboxPath);
    return tree;

  } catch (err) {
    console.error("🚨 Error in getProjectTreeService:", err);
    throw err;
  }
};


export const getUserProjectsService = async (userId) => {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }

  return data;
};



export const deleteProjectService = async (projectId, userId) => {
  const folderPath = path.resolve(`Projects/${projectId}`);
  const zipPath = path.resolve(`Projects/${projectId}.zip`);
  const storagePath = `${userId}/${projectId}.zip`;

  // 1️⃣ Delete from local folder and zip
  await fs.rm(folderPath, { recursive: true, force: true }).catch(() => {});
  await fs.unlink(zipPath).catch(() => {});

  // 2️⃣ Delete from Supabase Storage
  await supabase.storage
    .from('user-projects')
    .remove([storagePath]);

  // 3️⃣ Delete metadata from DB
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId);

  if (error) throw error;
};
