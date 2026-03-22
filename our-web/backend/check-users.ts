import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './src/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get(getRepositoryToken(User));
  
  const users = await userRepository.find();
  console.log('Total users:', users.length);
  users.forEach(u => {
    console.log(`- Email: ${u.email}, Name: ${u.full_name}, Role: ${u.role}`);
  });
  
  await app.close();
}
bootstrap();
