import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { join } from 'path';
import * as fs from 'fs';

dotenv.config({ path: join(__dirname, '..', '.env') });

async function run() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5435'),
    user: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'password123',
    database: process.env.DB_NAME || 'Finalproy1_dev',
  });

  try {
    await client.connect();
    const res = await client.query('SELECT id, user_name, slip_url FROM payments');
    let output = `Payments Count: ${res.rows.length}\n\n`;
    res.rows.forEach(r => {
      output += `ID: ${r.id} | User: ${r.user_name} | Slip: "${r.slip_url}"\n`;
    });
    fs.writeFileSync(join(__dirname, 'payments_dump.txt'), output);
    console.log('Written to payments_dump.txt');
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await client.end();
  }
}

run();
