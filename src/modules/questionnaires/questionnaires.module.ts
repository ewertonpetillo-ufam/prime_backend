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
import { PatientMedication } from '../../entities/patient-medication.entity';
import { MedicationReference } from '../../entities/medication-reference.entity';
import { ParkinsonPhenotype } from '../../entities/parkinson-phenotype.entity';
import { DyskinesiaType } from '../../entities/dyskinesia-type.entity';
import { HoehnYahrScale } from '../../entities/hoehn-yahr-scale.entity';
import { SurgeryType } from '../../entities/surgery-type.entity';
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
      PatientMedication,
      MedicationReference,
      ParkinsonPhenotype,
      DyskinesiaType,
      HoehnYahrScale,
      SurgeryType,
    ]),
    PatientsModule,
  ],
  controllers: [QuestionnairesController],
  providers: [QuestionnairesService],
  exports: [QuestionnairesService],
})
export class QuestionnairesModule {}

