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
    // ลบการแจ้งเตือนที่ข้อความซ้ำกัน เหลือไว้แค่อันเดียวต่อคน
    const res = await client.query(`
      DELETE FROM notification 
      WHERE id NOT IN (
        SELECT MIN(id) 
        FROM notification 
        GROUP BY user_id, message
      )
    `);
    console.log(`ลบการแจ้งเตือนที่ซ้ำกันออกไปแล้ว ${res.rowCount} รายการ`);
  } catch (err) {
    console.error('DB ERROR:', err);
  } finally {
    await client.end();
  }
}

run();
