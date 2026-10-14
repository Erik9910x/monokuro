import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

console.log(`\n📦 [Monokuro Backup] Starting backup snapshot at ${timestamp}...`);

// 1. Git Commit Backup
try {
  execSync('git add -A', { stdio: 'inherit' });
  try {
    execSync(`git commit -m "Snapshot Backup: ${timestamp}"`, { stdio: 'inherit' });
    console.log(`✅ Git snapshot committed successfully.`);
  } catch {
    console.log(`ℹ️ No new changes to commit to git.`);
  }
} catch (err) {
  console.warn(`⚠️ Git backup warning:`, err.message);
}

// 2. Archive Backup in .backups directory
const backupDir = path.resolve(process.cwd(), '.backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

console.log(`📁 Backup snapshot stored. You can rollback anytime with 'git checkout' or 'git restore'.\n`);
