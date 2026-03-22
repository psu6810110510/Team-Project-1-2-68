import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { join } from 'path';

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
    console.log('Connected to DB');
    const res = await client.query('SELECT id, user_name, slip_url FROM payments WHERE slip_url IS NOT NULL');
    console.log('Payments with slip_url:', res.rows.length);
    res.rows.forEach(r => {
      console.log(`ID: ${r.id} | User: ${r.user_name} | Slip: "${r.slip_url}"`);
    });
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await client.end();
  }
}

run();
