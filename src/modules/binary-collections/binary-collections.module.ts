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
import { ClinicalAssessment } from '../../entities/clinical-assessment.entity';
import { HoehnYahrScale } from '../../entities/hoehn-yahr-scale.entity';
import { PdfReport } from '../../entities/pdf-report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BinaryCollection,
      Patient,
      ActiveTaskDefinition,
      Questionnaire,
      ClinicalAssessment,
      HoehnYahrScale,
      PdfReport,
    ]),
  ],
  controllers: [BinaryCollectionsController, AdminCollectionOverviewController],
  providers: [BinaryCollectionsService, AdminCollectionOverviewService],
  exports: [BinaryCollectionsService],
})
export class BinaryCollectionsModule {}
