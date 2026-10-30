import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { env } from '../src/config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ekstrak info dari DATABASE_URL Prisma: mysql://USER:PASSWORD@HOST:PORT/DATABASE
// Format Prisma MySQL: mysql://root:password@localhost:3306/db_magang
const dbUrl = env.DATABASE_URL || '';
const match = dbUrl.match(/mysql:\/\/([^:]+):(.*)@([^:]+):(\d+)\/(.+)/);

if (!match) {
  console.error('❌ Gagal membaca DATABASE_URL. Pastikan format valid.');
  process.exit(1);
}

const [, user, password, host, port, database] = match;

const backupDir = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupDir, `${database}_backup_${timestamp}.sql`);

// Eksekusi mysqldump
const dumpCommand = `mysqldump -u ${user} -p"${password}" -h ${host} -P ${port} ${database} > "${backupFile}"`;

console.log('Memulai proses backup database...');

exec(dumpCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Backup gagal: ${error.message}`);
    return;
  }
  if (stderr && !stderr.includes('Warning: Using a password on the command line interface can be insecure')) {
    console.warn(`Peringatan selama backup: ${stderr}`);
  }
  console.log(`✅ Backup berhasil disimpan di: ${backupFile}`);
});
