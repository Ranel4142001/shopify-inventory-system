// scripts/dump.js
const mysqldump = require('mysqldump');
const path = require('path');

const outFile = path.resolve(process.cwd(), `backup_tactile_lab_${new Date().toISOString().slice(0,10)}.sql`);

mysqldump({
  connection: {
    host: 'localhost',
    port: 3400,
    user: 'root',
    password: '', // empty string because DB_PASSWORD is empty
    database: 'tactile_lab',
  },
  dumpToFile: outFile,
})
  .then(() => {
    console.log('Dump saved to:', outFile);
  })
  .catch((err) => {
    console.error('Dump failed:', err.message || err);
    process.exit(1);
  });
