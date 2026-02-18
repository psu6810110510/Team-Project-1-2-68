import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5435,
      username: 'admin',
      password: 'password123',
      database: 'Finalproy1_dev',
      entities: [], // เพิ่ม Entities ได้ที่นี่ในภายหลัง
      synchronize: true, // สร้าง Table อัตโนมัติ
    }),
  ],
})
export class AppModule {}