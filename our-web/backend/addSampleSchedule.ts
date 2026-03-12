import { DataSource } from 'typeorm';
import { Schedule } from './src/entities/schedule.entity';

async function main() {
  const ds = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5435,
    username: 'admin',
    password: 'password123',
    database: 'Finalproy1_dev',
    entities: [__dirname + '/src/entities/*.ts'],
  });

  await ds.initialize();

  const repo = ds.getRepository(Schedule);

  // replace this with the ID of the course you want to target
  const courseId = '508ef1b6-bcf0-45c8-9843-8733b3cd8f67'; // Full Stack Web Development

  // เพิ่มหลายเวลาเรียนพร้อมจำนวนที่นั่งต่างกัน
  const schedules = [
    {
      course_id: courseId,
      start_time: new Date('2026-03-24T07:00:00.000Z'),
      end_time: new Date('2026-03-24T10:00:00.000Z'),
      max_onsite_seats: 25,
      room_location: 'ห้องเรียน B1',
    },
    {
      course_id: courseId,
      start_time: new Date('2026-03-26T14:00:00.000Z'),
      end_time: new Date('2026-03-26T17:00:00.000Z'),
      max_onsite_seats: 30,
      room_location: 'ห้องเรียน B2',
    },
    {
      course_id: courseId,
      start_time: new Date('2026-03-31T07:00:00.000Z'),
      end_time: new Date('2026-03-31T10:00:00.000Z'),
      max_onsite_seats: 20,
      room_location: 'ห้องเรียน C1',
    },
  ];

  for (const scheduleData of schedules) {
    const newSchedule = repo.create(scheduleData);
    await repo.save(newSchedule);
    console.log(`✅ Added schedule ${newSchedule.id} (${scheduleData.max_onsite_seats} seats)`);
  }
  await ds.destroy();
}

main().catch(console.error);
