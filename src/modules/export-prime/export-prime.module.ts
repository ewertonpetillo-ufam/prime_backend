import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EXPORT_PRIME_QUEUE } from '../queues/queues.module';
import { QuestionnairesModule } from '../questionnaires/questionnaires.module';
import { BinaryCollectionsModule } from '../binary-collections/binary-collections.module';
import { StorageModule } from '../storage/storage.module';
import { ExportPrimeController } from './export-prime.controller';
import { ExportPrimeProcessor } from './export-prime.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: EXPORT_PRIME_QUEUE }),
    QuestionnairesModule,
    BinaryCollectionsModule,
    StorageModule,
  ],
  controllers: [ExportPrimeController],
  providers: [ExportPrimeProcessor],
})
export class ExportPrimeModule {}
