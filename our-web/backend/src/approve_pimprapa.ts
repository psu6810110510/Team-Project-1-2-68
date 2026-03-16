import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'admin',
  password: 'password123',
  database: 'Finalproy1_dev',
  synchronize: false,
});

async function run() {
  await AppDataSource.initialize();
  
  const users = await AppDataSource.query("SELECT id, full_name FROM users WHERE email = 'pimprapa@gmail.com'");
  
  if (users.length > 0) {
    const userId = users[0].id;
    const name = users[0].full_name;
    
    const teachers = await AppDataSource.query("SELECT id FROM teachers WHERE user_id = $1", [userId]);
    
    if (teachers.length === 0) {
      // Use standard Node crypto if available, otherwise just use a hardcoded-looking valid UUID for test!
      const hardcodedId = 'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5'; 
      await AppDataSource.query("INSERT INTO teachers (id, user_id, name, is_approved) VALUES ($1, $2, $3, true)", [hardcodedId, userId, name]);
      console.log('Created & Approved Teacher Profile for Pimprapa with hardcoded ID!');
    } else {
      await AppDataSource.query("UPDATE teachers SET is_approved = true WHERE user_id = $1", [userId]);
      console.log('Approved existing Teacher Profile!');
    }
  } else {
    console.log('User pimprapa@gmail.com not found!');
  }
  
  await AppDataSource.destroy();
}

run().catch(console.error);
