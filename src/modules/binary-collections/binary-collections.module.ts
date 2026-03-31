import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BinaryCollectionsService } from './binary-collections.service';
import { BinaryCollectionsController } from './binary-collections.controller';
import { AdminCollectionOverviewController } from '../admin-collection-overview/admin-collection-overview.controller';
import { AdminCollectionOverviewService } from '../admin-collection-overview/admin-collection-overview.service';
import { BinaryCollection } from '../../entities/binary-collection.entity';
import { Patient } from '../../entities/patient.entity';
import { ActiveTaskDefinition } from '../../entities/active-task-definition.entity';
import { Questionnaire } from '../../entities/questionnaire.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BinaryCollection, Patient, ActiveTaskDefinition, Questionnaire])],
  controllers: [BinaryCollectionsController, AdminCollectionOverviewController],
  providers: [BinaryCollectionsService, AdminCollectionOverviewService],
  exports: [BinaryCollectionsService],
})
export class BinaryCollectionsModule {}
