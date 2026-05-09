import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BART_SYNC_QUEUE } from '../queues/queues.module';
import { SamsungSyncModule } from '../samsung-sync/samsung-sync.module';
import { SamsungSyncRun } from '../../entities/samsung-sync-run.entity';
import { BartSyncController } from './bart-sync.controller';
import { BartSyncProcessor } from './bart-sync.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: BART_SYNC_QUEUE }),
    SamsungSyncModule,
    TypeOrmModule.forFeature([SamsungSyncRun]),
  ],
  controllers: [BartSyncController],
  providers: [BartSyncProcessor],
})
export class BartSyncModule {}
