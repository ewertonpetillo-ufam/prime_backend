import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Questionnaire } from '../../entities/questionnaire.entity';
import { Patient } from '../../entities/patient.entity';
import { AnthropometricData } from '../../entities/anthropometric-data.entity';
import { ClinicalAssessment } from '../../entities/clinical-assessment.entity';
import { GenderType } from '../../entities/gender-type.entity';
import { EthnicityType } from '../../entities/ethnicity-type.entity';
import { EducationLevel } from '../../entities/education-level.entity';
import { MaritalStatusType } from '../../entities/marital-status-type.entity';
import { IncomeRange } from '../../entities/income-range.entity';
import { PatientsService } from '../patients/patients.service';
import { CryptoUtil } from '../../utils/crypto.util';
import { SaveStep1Dto } from './dto/save-step1.dto';
import { SaveStep2Dto } from './dto/save-step2.dto';
import { SaveStep3Dto } from './dto/save-step3.dto';

@Injectable()
export class QuestionnairesService {
  constructor(
    @InjectRepository(Questionnaire)
    private questionnairesRepository: Repository<Questionnaire>,
    @InjectRepository(AnthropometricData)
    private anthropometricDataRepository: Repository<AnthropometricData>,
    @InjectRepository(ClinicalAssessment)
    private clinicalAssessmentRepository: Repository<ClinicalAssessment>,
    @InjectRepository(GenderType)
    private genderTypeRepository: Repository<GenderType>,
    @InjectRepository(EthnicityType)
    private ethnicityTypeRepository: Repository<EthnicityType>,
    @InjectRepository(EducationLevel)
    private educationLevelRepository: Repository<EducationLevel>,
    @InjectRepository(MaritalStatusType)
    private maritalStatusTypeRepository: Repository<MaritalStatusType>,
    @InjectRepository(IncomeRange)
    private incomeRangeRepository: Repository<IncomeRange>,
    private patientsService: PatientsService,
  ) {}

  /**
   * Map frontend gender value to gender_id
   */
  private async mapGenderToId(gender?: string): Promise<number | null> {
    if (!gender) return null;
    const mapping: Record<string, string> = {
      'M': 'M',
      'F': 'F',
      'Masculino': 'M',
      'Feminino': 'F',
      'Outro': 'OTHER',
    };
    const code = mapping[gender] || gender;
    const genderType = await this.genderTypeRepository.findOne({
      where: { code },
    });
    return genderType?.id || null;
  }

  /**
   * Map frontend ethnicity value to ethnicity_id
   */
  private async mapEthnicityToId(etnia?: string): Promise<number | null> {
    if (!etnia) return null;
    const mapping: Record<string, string> = {
      'Branco': 'WHITE',
      'Negro': 'BLACK',
      'Pardo': 'BROWN',
      'Amarelo': 'ASIAN',
      'Indígena': 'INDIGENOUS',
      'Outro': 'OTHER',
    };
    const code = mapping[etnia] || etnia;
    const ethnicityType = await this.ethnicityTypeRepository.findOne({
      where: { code },
    });
    return ethnicityType?.id || null;
  }

  /**
   * Map frontend education value to education_level_id
   */
  private async mapEducationToId(education?: string): Promise<number | null> {
    if (!education) return null;
    const mapping: Record<string, string> = {
      'Analfabeto': 'ILLITERATE',
      'Ensino Fundamental Incompleto': 'ELEMENTARY_INCOMPLETE',
      'Ensino Fundamental Completo': 'ELEMENTARY_COMPLETE',
      'Ensino Médio Incompleto': 'HIGH_SCHOOL_INCOMPLETE',
      'Ensino Médio Completo': 'HIGH_SCHOOL_COMPLETE',
      'Ensino Superior Incompleto': 'COLLEGE_INCOMPLETE',
      'Ensino Superior Completo': 'COLLEGE_COMPLETE',
      'Pós-Graduação': 'POST_GRADUATE',
      'Outro': 'OTHER',
    };
    const code = mapping[education] || education;
    const educationLevel = await this.educationLevelRepository.findOne({
      where: { code },
    });
    return educationLevel?.id || null;
  }

  /**
   * Map frontend marital status value to marital_status_id
   */
  private async mapMaritalStatusToId(maritalStatus?: string): Promise<number | null> {
    if (!maritalStatus) return null;
    const mapping: Record<string, string> = {
      'Solteiro': 'SINGLE',
      'Casado': 'MARRIED',
      'União estável': 'DOMESTIC_PARTNERSHIP',
      'Prefere não informar': 'PREFER_NOT_SAY',
    };
    const code = mapping[maritalStatus] || maritalStatus;
    const maritalStatusType = await this.maritalStatusTypeRepository.findOne({
      where: { code },
    });
    return maritalStatusType?.id || null;
  }

  /**
   * Map frontend income range value to income_range_id
   */
  private async mapIncomeRangeToId(rendaFamiliar?: string): Promise<number | null> {
    if (!rendaFamiliar) return null;
    const mapping: Record<string, string> = {
      'ate_1_salario': 'UP_TO_1',
      '2_4_salarios': '2_TO_4',
      '4_salarios_ou_mais': '4_PLUS',
    };
    const code = mapping[rendaFamiliar] || rendaFamiliar;
    const incomeRange = await this.incomeRangeRepository.findOne({
      where: { code },
    });
    return incomeRange?.id || null;
  }

  /**
   * Parse smoking duration from string (e.g., "10 anos" -> 10)
   */
  private parseSmokingDuration(duration?: string): number | null {
    if (!duration) return null;
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Save Step 1: Create or update patient and questionnaire
   */
  async saveStep1(dto: SaveStep1Dto, evaluatorId: string): Promise<{ questionnaireId: string; patientId: string }> {
    // Normalize CPF (remove formatting)
    const cpf = dto.cpf.replace(/\D/g, '');
    
    // Try to find existing patient by CPF
    let patient: Patient;
    try {
      patient = await this.patientsService.findByCpf(cpf);
    } catch (error) {
      // Patient doesn't exist, create new one
      patient = null;
    }

    // Map frontend values to IDs
    const gender_id = await this.mapGenderToId(dto.gender);
    const ethnicity_id = await this.mapEthnicityToId(dto.etnia);
    const education_level_id = await this.mapEducationToId(dto.education);
    const marital_status_id = await this.mapMaritalStatusToId(dto.maritalStatus);
    const income_range_id = await this.mapIncomeRangeToId(dto.rendaFamiliar);

    // Determine smoking status
    const is_current_smoker = dto.fumaCase === 'Sim' || dto.fumaCase === true;
    const smoking_duration_years = is_current_smoker 
      ? this.parseSmokingDuration(dto.smokingDuration) 
      : null;
    const years_since_quit_smoking = !is_current_smoker && dto.fumouAntes === 'Sim'
      ? this.parseSmokingDuration(dto.stoppedSmokingDuration)
      : null;

    // Create or update patient
    if (patient) {
      // Update existing patient
      await this.patientsService.update(patient.id, {
        full_name: dto.fullName,
        date_of_birth: dto.birthday,
        gender_id,
        ethnicity_id,
        nationality: dto.nationality || 'Brasileiro',
        email: dto.email,
        phone_primary: dto.phoneNumber,
        phone_secondary: dto.phoneNumberContact,
        education_level_id,
        education_other: dto.educationOther,
        marital_status_id,
        occupation: dto.occupation,
        income_range_id,
        is_current_smoker,
        smoking_duration_years,
        years_since_quit_smoking,
      });
      // Reload patient to get updated data
      patient = await this.patientsService.findOne(patient.id);
    } else {
      // Create new patient
      patient = await this.patientsService.create({
        cpf,
        full_name: dto.fullName,
        date_of_birth: dto.birthday,
        gender_id,
        ethnicity_id,
        nationality: dto.nationality || 'Brasileiro',
        email: dto.email,
        phone_primary: dto.phoneNumber,
        phone_secondary: dto.phoneNumberContact,
        education_level_id,
        education_other: dto.educationOther,
        marital_status_id,
        occupation: dto.occupation,
        income_range_id,
        is_current_smoker,
        smoking_duration_years,
        years_since_quit_smoking,
      });
    }

    // Find or create questionnaire for this patient and evaluator
    let questionnaire = await this.questionnairesRepository.findOne({
      where: {
        patient_id: patient.id,
        evaluator_id: evaluatorId,
        status: 'draft',
      },
      order: { created_at: 'DESC' },
    });

    if (!questionnaire) {
      // Create new questionnaire
      questionnaire = this.questionnairesRepository.create({
        patient_id: patient.id,
        evaluator_id: evaluatorId,
        collection_date: new Date(dto.dataColeta),
        status: 'in_progress',
      });
      questionnaire = await this.questionnairesRepository.save(questionnaire);
    } else {
      // Update existing questionnaire
      questionnaire.collection_date = new Date(dto.dataColeta);
      questionnaire.status = 'in_progress';
      questionnaire = await this.questionnairesRepository.save(questionnaire);
    }

    return {
      questionnaireId: questionnaire.id,
      patientId: patient.id,
    };
  }

  /**
   * Save Step 2: Save anthropometric data
   */
  async saveStep2(dto: SaveStep2Dto): Promise<AnthropometricData> {
    const questionnaire = await this.questionnairesRepository.findOne({
      where: { id: dto.questionnaireId },
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${dto.questionnaireId} not found`);
    }

    // Find or create anthropometric data
    let anthropometricData = await this.anthropometricDataRepository.findOne({
      where: { questionnaire_id: dto.questionnaireId },
    });

    if (!anthropometricData) {
      anthropometricData = this.anthropometricDataRepository.create({
        questionnaire_id: dto.questionnaireId,
        weight_kg: dto.weight ? parseFloat(String(dto.weight)) : null,
        height_cm: dto.height ? parseFloat(String(dto.height)) : null,
        waist_circumference_cm: dto.waistSize ? parseFloat(String(dto.waistSize)) : null,
        hip_circumference_cm: dto.hipSize ? parseFloat(String(dto.hipSize)) : null,
        neck_circumference_cm: dto.abdominal ? parseFloat(String(dto.abdominal)) : null,
      });
    } else {
      anthropometricData.weight_kg = dto.weight ? parseFloat(String(dto.weight)) : anthropometricData.weight_kg;
      anthropometricData.height_cm = dto.height ? parseFloat(String(dto.height)) : anthropometricData.height_cm;
      anthropometricData.waist_circumference_cm = dto.waistSize ? parseFloat(String(dto.waistSize)) : anthropometricData.waist_circumference_cm;
      anthropometricData.hip_circumference_cm = dto.hipSize ? parseFloat(String(dto.hipSize)) : anthropometricData.hip_circumference_cm;
      anthropometricData.neck_circumference_cm = dto.abdominal ? parseFloat(String(dto.abdominal)) : anthropometricData.neck_circumference_cm;
    }

    return await this.anthropometricDataRepository.save(anthropometricData);
  }

  /**
   * Save Step 3: Save clinical assessment data
   */
  async saveStep3(dto: SaveStep3Dto): Promise<ClinicalAssessment> {
    const questionnaire = await this.questionnairesRepository.findOne({
      where: { id: dto.questionnaireId },
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${dto.questionnaireId} not found`);
    }

    // Find or create clinical assessment
    let clinicalAssessment = await this.clinicalAssessmentRepository.findOne({
      where: { questionnaire_id: dto.questionnaireId },
    });

    // Map Hoehn-Yahr scale to ID (if needed, you may need to query the table)
    // For now, storing as string and converting later if needed
    const hoehnYahrStageId = dto.scaleHY ? parseFloat(dto.scaleHY) * 2 : null; // Approximate mapping

    // Map Schwab & England score
    const schwabEnglandScore = dto.scaleSE ? parseInt(dto.scaleSE, 10) : null;

    // Parse family case
    const has_family_history = dto.familyCase === 'Sim';

    // Parse dyskinesia type (simplified - you may need to query dyskinesia_types table)
    const dyskinesia_type_id = dto.fogClassifcation ? null : null; // TODO: Map to actual IDs

    // Parse average ON time hours
    const average_on_time_hours = dto.durationWearingOff 
      ? this.parseSmokingDuration(dto.durationWearingOff) 
      : null;

    // Parse L-Dopa onset time hours
    const ldopa_onset_time_hours = dto.durationLDopa
      ? this.parseSmokingDuration(dto.durationLDopa)
      : null;

    if (!clinicalAssessment) {
      clinicalAssessment = this.clinicalAssessmentRepository.create({
        questionnaire_id: dto.questionnaireId,
        diagnostic_description: dto.diagnosticDescription || '',
        age_at_onset: dto.onsetAge ? parseInt(String(dto.onsetAge), 10) : null,
        initial_symptom: dto.initialSympton,
        affected_side: dto.parkinsonSide,
        hoehn_yahr_stage_id: hoehnYahrStageId,
        schwab_england_score: schwabEnglandScore,
        has_family_history,
        family_kinship_degree: dto.kinshipDegree,
        has_dyskinesia: dto.diskinectiaPresence || false,
        has_freezing_of_gait: dto.fog || false,
        has_wearing_off: dto.wearingOff || false,
        average_on_time_hours,
        has_delayed_on: dto.DelayOn || false,
        ldopa_onset_time_hours,
        assessed_on_levodopa: dto.levodopaOn || false,
        dyskinesia_type_id,
        comorbidities: dto.comorbidities,
        other_medications: dto.otherMedications,
      });
    } else {
      clinicalAssessment.diagnostic_description = dto.diagnosticDescription || clinicalAssessment.diagnostic_description;
      clinicalAssessment.age_at_onset = dto.onsetAge ? parseInt(String(dto.onsetAge), 10) : clinicalAssessment.age_at_onset;
      clinicalAssessment.initial_symptom = dto.initialSympton || clinicalAssessment.initial_symptom;
      clinicalAssessment.affected_side = dto.parkinsonSide || clinicalAssessment.affected_side;
      clinicalAssessment.hoehn_yahr_stage_id = hoehnYahrStageId || clinicalAssessment.hoehn_yahr_stage_id;
      clinicalAssessment.schwab_england_score = schwabEnglandScore || clinicalAssessment.schwab_england_score;
      clinicalAssessment.has_family_history = has_family_history;
      clinicalAssessment.family_kinship_degree = dto.kinshipDegree || clinicalAssessment.family_kinship_degree;
      clinicalAssessment.has_dyskinesia = dto.diskinectiaPresence || clinicalAssessment.has_dyskinesia;
      clinicalAssessment.has_freezing_of_gait = dto.fog || clinicalAssessment.has_freezing_of_gait;
      clinicalAssessment.has_wearing_off = dto.wearingOff || clinicalAssessment.has_wearing_off;
      clinicalAssessment.average_on_time_hours = average_on_time_hours || clinicalAssessment.average_on_time_hours;
      clinicalAssessment.has_delayed_on = dto.DelayOn || clinicalAssessment.has_delayed_on;
      clinicalAssessment.ldopa_onset_time_hours = ldopa_onset_time_hours || clinicalAssessment.ldopa_onset_time_hours;
      clinicalAssessment.assessed_on_levodopa = dto.levodopaOn || clinicalAssessment.assessed_on_levodopa;
      clinicalAssessment.dyskinesia_type_id = dyskinesia_type_id || clinicalAssessment.dyskinesia_type_id;
      clinicalAssessment.comorbidities = dto.comorbidities || clinicalAssessment.comorbidities;
      clinicalAssessment.other_medications = dto.otherMedications || clinicalAssessment.other_medications;
    }

    return await this.clinicalAssessmentRepository.save(clinicalAssessment);
  }
}

