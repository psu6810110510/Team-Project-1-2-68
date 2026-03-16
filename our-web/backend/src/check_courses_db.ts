import { Client } from 'pg';

async function run() {
  const client = new Client({
    host: 'localhost',
    port: 5435,
    user: 'admin',
    password: 'password123',
    database: 'Finalproy1_dev',
  });

  try {
    await client.connect();
    const res = await client.query('SELECT title, status, is_active FROM course');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('DB ERROR:', err);
  } finally {
    await client.end();
  }
}

run();
