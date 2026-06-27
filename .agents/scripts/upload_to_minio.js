
import AdmZip from 'adm-zip';
import * as Minio from 'minio';
import path from 'path';
import fs from 'fs';

const minioClient = new Minio.Client({
  endPoint: 's3.asisteme.ai',
  useSSL: true, 
  accessKey: 'asistemeadmin',
  secretKey: 'wASJtWqrXzRahIS/vV8KL2gs+zTI6SY1'
});

const bucketName = 'asisteme-agents-skills';

async function createZip(sourceDir, outPath) {
  console.log(`Zipping ${sourceDir} to ${outPath}...`);
  const zip = new AdmZip();
  zip.addLocalFolder(sourceDir);
  zip.writeZip(outPath);
  console.log(`Done: ${outPath}`);
}

async function uploadFile(bucket, remotePath, localPath) {
  console.log(`Uploading ${localPath} to ${remotePath}...`);
  await minioClient.fPutObject(bucket, remotePath, localPath);
  console.log(`Upload complete: ${remotePath}`);
}

async function run() {
  try {
    const agentZipPath = path.resolve('agent.zip');
    const skillsZipPath = path.resolve('skills.zip');

    // Create Zips
    await createZip('.agent', agentZipPath);
    await createZip('masSkills', skillsZipPath);

    // Upload
    await uploadFile(bucketName, 'agent.zip', agentZipPath);
    await uploadFile(bucketName, 'skills.zip', skillsZipPath);

    console.log('--- ALL UPDATED ON MINIO ---');
    
    // Cleanup
    fs.unlinkSync(agentZipPath);
    fs.unlinkSync(skillsZipPath);
  } catch (err) {
    console.error('Error during upload:', err);
    process.exit(1);
  }
}

run();
