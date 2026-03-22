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

    // 1. Find Course ID
    const courseRes = await client.query(`
      SELECT id FROM course 
      WHERE title LIKE '%Data Structures%'
      LIMIT 1
    `);

    if (courseRes.rows.length === 0) {
      console.error("❌ ไม่พบคอร์ส Data Structures ในฐานข้อมูล");
      return;
    }

    const courseId = courseRes.rows[0].id;
    console.log(`✅ พบคอร์ส ID: ${courseId}`);

    const res = await client.query(`
      SELECT id, topic_name, video_url 
      FROM lessons 
      WHERE course_id = $1
    `, [courseId]);

    console.log(`--- บทเรียน (${res.rows.length} รายการ) ---`);
    for (const row of res.rows) {
      console.log(`제목: ${row.topic_name} | Video: ${row.video_url}`);
    }

  } catch (err) {
    console.error('DB ERROR:', err);
  } finally {
    await client.end();
  }
}

run();
