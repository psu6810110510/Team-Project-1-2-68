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
  
  console.log('--- USERS ---');
  const users = await AppDataSource.query("SELECT id, full_name, email FROM users WHERE full_name LIKE '%พิมประภา%' OR full_name LIKE '%เอกภพ%'");
  console.log(users);
  
  console.log('--- TEACHERS ---');
  const teachers = await AppDataSource.query("SELECT id, user_id, name FROM teachers WHERE name LIKE '%พิมประภา%' OR name LIKE '%เอกภพ%'");
  console.log(teachers);
  
  await AppDataSource.destroy();
}

run().catch(console.error);
