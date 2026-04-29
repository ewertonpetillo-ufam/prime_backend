import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from '../../entities/patient.entity';
import { BinaryCollection } from '../../entities/binary-collection.entity';
import { SamsungSyncRun } from '../../entities/samsung-sync-run.entity';
import { SamsungSyncRunItem } from '../../entities/samsung-sync-run-item.entity';
import { ArtifactoryService } from './artifactory.service';
import { SamsungSyncService } from './samsung-sync.service';
import { SamsungSyncController } from './samsung-sync.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      BinaryCollection,
      SamsungSyncRun,
      SamsungSyncRunItem,
    ]),
  ],
  providers: [ArtifactoryService, SamsungSyncService],
  controllers: [SamsungSyncController],
  exports: [SamsungSyncService],
})
export class SamsungSyncModule {}
