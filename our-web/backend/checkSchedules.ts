import { DataSource } from 'typeorm';
import { Schedule } from './src/entities/schedule.entity';
import { Course } from './src/entities/course.entity';

async function main() {
  const ds = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5435,
    username: 'admin',
    password: 'password123',
    database: 'Finalproy1_dev',
    // load all entity definitions from project
    entities: [__dirname + '/src/entities/*.ts'],
  });
  await ds.initialize();
  const schedules = await ds.getRepository(Schedule).find();
  console.log('schedules count', schedules.length);
  console.table(schedules.map(s=>({id:s.id, course_id:s.course_id, start_time:s.start_time})));

  const courses = await ds.getRepository('Course').find();
  console.log('courses in DB:');
  console.table(courses.map((c:any)=>({id:c.id,title:c.title})));
  await ds.destroy();
}

main().catch(console.error);
