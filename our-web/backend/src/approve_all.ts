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
  
  // Use raw SQL to bypass entity metadata issues
  const result = await AppDataSource.query('UPDATE teachers SET is_approved = true');
  console.log('Update result:', result);
  
  await AppDataSource.destroy();
  console.log('All teachers Approved for testing with raw SQL!');
}

run().catch(console.error);
