const { Client } = require('pg');

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

    const res = await client.query(`
      SELECT id, topic_name, video_url, pdf_url 
      FROM lessons 
      ORDER BY id DESC
      LIMIT 10
    `);

    console.log(`--- Recent Lessons (${res.rows.length}) ---`);
    for (const row of res.rows) {
      console.log(`[${row.id}] ${row.topic_name}\nVideo: ${row.video_url}\nPDF: ${row.pdf_url}\n`);
    }

  } catch (err) {
    console.error('DB ERROR:', err);
  } finally {
    await client.end();
  }
}

run();
