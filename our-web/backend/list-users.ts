import { Client } from 'pg';
require('dotenv').config();

async function listUsers() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5435'),
    user: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'password123',
    database: process.env.DB_NAME || 'Finalproy1_dev',
  });

  try {
    await client.connect();
    const res = await client.query('SELECT email, full_name, password_hash, google_id FROM "user"');
    console.log(`Found ${res.rows.length} users:`);
    res.rows.forEach(r => {
      console.log(`- ${r.email} | Hash: ${r.password_hash ? 'YES' : 'NO'} | GoogleID: ${r.google_id}`);
    });
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

listUsers();
