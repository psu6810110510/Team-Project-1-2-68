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

    const courseRes = await client.query(`
      SELECT id FROM courses 
      WHERE title LIKE '%Data Structures%'
      LIMIT 1
    `);

    if (courseRes.rows.length === 0) {
      console.error("❌ ไม่พบคอร์ส");
      return;
    }

    const courseId = courseRes.rows[0].id;
    console.log(`✅ ID: ${courseId}`);

    const res = await client.query(`
      SELECT id, topic_name, video_url, pdf_url 
      FROM lessons 
      WHERE course_id = $1
    `, [courseId]);

    console.log(`--- Lessons (${res.rows.length}) ---`);
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
