import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EXPORT_ZIP_QUEUE } from '../queues/queues.module';
import { QuestionnairesModule } from '../questionnaires/questionnaires.module';
import { StorageModule } from '../storage/storage.module';
import { ExportZipController } from './export-zip.controller';
import { ExportZipProcessor } from './export-zip.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: EXPORT_ZIP_QUEUE }),
    QuestionnairesModule,
    StorageModule,
  ],
  controllers: [ExportZipController],
  providers: [ExportZipProcessor],
})
export class ExportZipModule {}
