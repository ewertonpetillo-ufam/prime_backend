import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionnairesService } from './questionnaires.service';
import { QuestionnairesController } from './questionnaires.controller';
import { Questionnaire } from '../../entities/questionnaire.entity';
import { AnthropometricData } from '../../entities/anthropometric-data.entity';
import { ClinicalAssessment } from '../../entities/clinical-assessment.entity';
import { GenderType } from '../../entities/gender-type.entity';
import { EthnicityType } from '../../entities/ethnicity-type.entity';
import { EducationLevel } from '../../entities/education-level.entity';
import { MaritalStatusType } from '../../entities/marital-status-type.entity';
import { IncomeRange } from '../../entities/income-range.entity';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Questionnaire,
      AnthropometricData,
      ClinicalAssessment,
      GenderType,
      EthnicityType,
      EducationLevel,
      MaritalStatusType,
      IncomeRange,
    ]),
    PatientsModule,
  ],
  controllers: [QuestionnairesController],
  providers: [QuestionnairesService],
  exports: [QuestionnairesService],
})
export class QuestionnairesModule {}

