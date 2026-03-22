import { Client } from 'pg';
import * as bcrypt from 'bcrypt';
require('dotenv').config();

async function checkUser() {
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

    const email = 'puntippar@gmail.com';
    const res = await client.query('SELECT * FROM "user" WHERE email = $1', [email]);
    
    if (res.rows.length === 0) {
      console.log(`User ${email} not found.`);
    } else {
      const user = res.rows[0];
      console.log(`User found: ${user.email}, Role: ${user.role}, Name: ${user.full_name}`);
      
      const pwdMatch = await bcrypt.compare('1234', user.password_hash);
      console.log('Password match with 1234:', pwdMatch);
      console.log('Hash in DB:', user.password_hash);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkUser();
