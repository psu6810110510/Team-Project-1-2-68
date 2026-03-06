import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatQuota } from '../../entities/seat-quota.entity';
import { Schedule } from '../../entities/schedule.entity';
import { SeatQuotaService } from './seat-quota.service';
import { SeatQuotaController } from './seat-quota.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SeatQuota, Schedule])],
  controllers: [SeatQuotaController],
  providers: [SeatQuotaService],
  exports: [SeatQuotaService],
})
export class SeatQuotaModule {}
