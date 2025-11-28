import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Questionnaire } from '../../entities/questionnaire.entity';
import { Patient } from '../../entities/patient.entity';
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
import { PatientsService } from '../patients/patients.service';
import { CryptoUtil } from '../../utils/crypto.util';
import { SaveStep1Dto } from './dto/save-step1.dto';
import { SaveStep2Dto } from './dto/save-step2.dto';
import { SaveStep3Dto } from './dto/save-step3.dto';
import { Updrs3Score } from '../../entities/updrs3-score.entity';
import { MeemScore } from '../../entities/meem-score.entity';
import { UdysrsScore } from '../../entities/udysrs-score.entity';
import { StopbangScore } from '../../entities/stopbang-score.entity';
import { EpworthScore } from '../../entities/epworth-score.entity';
import { Pdss2Score } from '../../entities/pdss2-score.entity';
import { RbdsqScore } from '../../entities/rbdsq-score.entity';
import { FogqScore } from '../../entities/fogq-score.entity';
import { BinaryCollection } from '../../entities/binary-collection.entity';
import { PdfReport } from '../../entities/pdf-report.entity';
import { SaveUpdrs3Dto } from './dto/save-updrs3.dto';
import { SaveMeemDto } from './dto/save-meem.dto';
import { SaveUdysrsDto } from './dto/save-udysrs.dto';
import { SaveStopbangDto } from './dto/save-stopbang.dto';
import { SaveEpworthDto } from './dto/save-epworth.dto';
import { SavePdss2Dto } from './dto/save-pdss2.dto';
import { SaveRbdsqDto } from './dto/save-rbdsq.dto';
import { SaveFogqDto } from './dto/save-fogq.dto';

const UPDRS_SCORE_FIELDS = [
  'speech',
  'facial_expression',
  'rigidity_neck',
  'rigidity_rue',
  'rigidity_lue',
  'rigidity_rle',
  'rigidity_lle',
  'finger_tapping_right',
  'finger_tapping_left',
  'hand_movements_right',
  'hand_movements_left',
  'pronation_supination_right',
  'pronation_supination_left',
  'toe_tapping_right',
  'toe_tapping_left',
  'leg_agility_right',
  'leg_agility_left',
  'rising_from_chair',
  'gait',
  'freezing_of_gait',
  'postural_stability',
  'posture',
  'global_bradykinesia',
  'postural_tremor_right',
  'postural_tremor_left',
  'kinetic_tremor_right',
  'kinetic_tremor_left',
  'rest_tremor_rue',
  'rest_tremor_lue',
  'rest_tremor_rle',
  'rest_tremor_lle',
  'rest_tremor_lip_jaw',
  'postural_tremor_amplitude',
  'dyskinesia_present',
  'dyskinesia_interfered',
] as const;

const MEEM_SCORE_FIELDS = [
  'orientation_day',
  'orientation_date',
  'orientation_month',
  'orientation_year',
  'orientation_time',
  'orientation_location',
  'orientation_institution',
  'orientation_city',
  'orientation_state',
  'orientation_country',
  'registration_word1',
  'registration_word2',
  'registration_word3',
  'attention_calc1',
  'attention_calc2',
  'attention_calc3',
  'attention_calc4',
  'attention_calc5',
  'recall_word1',
  'recall_word2',
  'recall_word3',
  'language_naming1',
  'language_naming2',
  'language_repetition',
  'language_command1',
  'language_command2',
  'language_command3',
  'language_reading',
  'language_writing',
  'language_copying',
] as const;

const UDYSRS_SCORE_FIELDS = [
  'on_dyskinesia_time',
  'impact_speech',
  'impact_chewing',
  'impact_eating',
  'impact_dressing',
  'impact_hygiene',
  'impact_writing',
  'impact_hobbies',
  'impact_walking',
  'impact_social',
  'impact_emotional',
  'off_dystonia_time',
  'dystonia_activities',
  'dystonia_pain_impact',
  'dystonia_pain_severity',
  'severity_face',
  'severity_neck',
  'severity_right_arm',
  'severity_left_arm',
  'severity_trunk',
  'severity_right_leg',
  'severity_left_leg',
  'disability_communication',
  'disability_drinking',
  'disability_dressing',
  'disability_walking',
] as const;

const STOPBANG_SCORE_FIELDS = [
  'snoring',
  'tired',
  'observed_apnea',
  'blood_pressure',
  'bmi_over_35',
  'age_over_50',
  'neck_circumference_large',
  'gender_male',
] as const;

const EPWORTH_SCORE_FIELDS = [
  'sitting_reading',
  'watching_tv',
  'sitting_inactive_public',
  'passenger_car',
  'lying_down_afternoon',
  'sitting_talking',
  'sitting_after_lunch',
  'car_stopped_traffic',
] as const;

const PDSS2_SCORE_FIELDS = [
  'q1',
  'q2',
  'q3',
  'q4',
  'q5',
  'q6',
  'q7',
  'q8',
  'q9',
  'q10',
  'q11',
  'q12',
  'q13',
  'q14',
  'q15',
] as const;

const RBDSQ_SCORE_FIELDS = [
  'q1_vivid_dreams',
  'q2_aggressive_content',
  'q3_dream_enactment',
  'q4_limb_movements',
  'q5_injury_potential',
  'q6_bed_disruption',
  'q7_awakening_recall',
  'q8_sleep_disruption',
  'q9_neurological_disorder',
  'q10_rem_behavior_problem',
] as const;

const FOGQ_SCORE_FIELDS = [
  'gait_worst_state',
  'impact_daily_activities',
  'feet_stuck',
  'longest_episode',
  'hesitation_initiation',
  'hesitation_turning',
] as const;

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
    @InjectRepository(PatientMedication)
    private patientMedicationRepository: Repository<PatientMedication>,
    @InjectRepository(MedicationReference)
    private medicationReferenceRepository: Repository<MedicationReference>,
    @InjectRepository(ParkinsonPhenotype)
    private parkinsonPhenotypeRepository: Repository<ParkinsonPhenotype>,
    @InjectRepository(DyskinesiaType)
    private dyskinesiaTypeRepository: Repository<DyskinesiaType>,
    @InjectRepository(HoehnYahrScale)
    private hoehnYahrScaleRepository: Repository<HoehnYahrScale>,
    @InjectRepository(SurgeryType)
    private surgeryTypeRepository: Repository<SurgeryType>,
    @InjectRepository(Updrs3Score)
    private updrs3Repository: Repository<Updrs3Score>,
    @InjectRepository(MeemScore)
    private meemRepository: Repository<MeemScore>,
    @InjectRepository(UdysrsScore)
    private udysrsRepository: Repository<UdysrsScore>,
    @InjectRepository(StopbangScore)
    private stopbangRepository: Repository<StopbangScore>,
    @InjectRepository(EpworthScore)
    private epworthRepository: Repository<EpworthScore>,
    @InjectRepository(Pdss2Score)
    private pdss2Repository: Repository<Pdss2Score>,
    @InjectRepository(RbdsqScore)
    private rbdsqRepository: Repository<RbdsqScore>,
    @InjectRepository(FogqScore)
    private fogqRepository: Repository<FogqScore>,
    @InjectRepository(BinaryCollection)
    private binaryCollectionRepository: Repository<BinaryCollection>,
    @InjectRepository(PdfReport)
    private pdfReportRepository: Repository<PdfReport>,
    private patientsService: PatientsService,
  ) {}

  private assignScoreFields(
    target: Record<string, any>,
    dto: Record<string, any>,
    fields: readonly string[],
  ) {
    fields.forEach((field) => {
      const value = dto[field];
      if (value !== undefined) {
        target[field] = value;
      }
    });
  }

  private extractScoreData(
    source: Record<string, any> | null | undefined,
    fields: readonly string[],
    extraFields: string[] = [],
  ) {
    if (!source) {
      return null;
    }

    const data: Record<string, any> = {};

    fields.forEach((field) => {
      data[field] = source[field] ?? null;
    });

    extraFields.forEach((field) => {
      if (field in source) {
        data[field] = source[field];
      }
    });

    return data;
  }

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
   * Normalize "Sim"/"Não" style answers (or boolean-ish strings) to booleans
   */
  private normalizeYesNoBoolean(value?: string | boolean): boolean | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'boolean') return value;
    const normalized = value.trim().toLowerCase();
    if (['sim', 'true', '1'].includes(normalized)) return true;
    if (['não', 'nao', 'false', '0'].includes(normalized)) return false;
    return null;
  }

  /**
   * Normalize affected side value to match database constraint
   * Valid values: 'Direito', 'Esquerdo', 'Bilateral', 'Não especificado'
   */
  private normalizeAffectedSide(side?: string): string | null {
    if (!side || side.trim() === '') return null;
    
    const normalized = side.trim();
    const lower = normalized.toLowerCase();
    
    // Map common variations to valid values
    if (lower === 'direito' || lower === 'd' || lower === 'right') {
      return 'Direito';
    }
    if (lower === 'esquerdo' || lower === 'e' || lower === 'left') {
      return 'Esquerdo';
    }
    if (lower === 'bilateral' || lower === 'b' || lower === 'ambos' || lower === 'both') {
      return 'Bilateral';
    }
    if (
      lower === 'não especificado' || 
      lower === 'nao especificado' ||
      lower === 'não especificado' ||
      lower === 'n/a' ||
      lower === 'na' ||
      lower === 'não informado' ||
      lower === 'nao informado' ||
      lower === 'not specified'
    ) {
      return 'Não especificado';
    }
    
    // If it matches one of the valid values exactly (case-insensitive), return it
    const validValues = ['Direito', 'Esquerdo', 'Bilateral', 'Não especificado'];
    const matched = validValues.find(v => v.toLowerCase() === lower);
    if (matched) {
      return matched;
    }
    
    // If no match, return null (will be stored as null, which is allowed)
    return null;
  }

  /**
   * Get or create medication reference by drug name
   * Uses the same LED conversion factors as the frontend
   */
  private async getOrCreateMedicationReference(drugName: string): Promise<MedicationReference> {
    if (!drugName || drugName.trim() === '') {
      throw new BadRequestException('Drug name is required');
    }

    // Try to find existing medication by name (case-insensitive)
    let medication = await this.medicationReferenceRepository.findOne({
      where: { drug_name: drugName.trim() },
    });

    if (medication) {
      return medication;
    }

    // LED conversion factors (same as frontend)
    const LEDD_CONVERSION_FACTORS: Record<string, number> = {
      'Amantadine': 1,
      'Apomorphine': 10,
      'Azilect': 100, // rasagiline
      'Bromocriptine': 10,
      'Cabergoline': 80,
      'Duodopa': 1.11,
      'Levodopa': 1,
      'Levodopa CR': 0.75,
      'Levodopa with Entacapone': 1.33,
      'Levodopa with Tolcapone': 1.5,
      'Lisuride': 100,
      'Madopar': 1, // levodopa+benserazida
      'Mirapex': 100, // pramipexole
      'Pergolide': 100,
      'Pramipexole': 100,
      'Rasagiline': 100,
      'Requip': 20, // ropinirole
      'RequipXL': 20, // ropinirole CR
      'Ropinirole': 20,
      'RopiniroleCR': 20,
      'Rotigotine': 30,
      'Rytary': 0.6,
      'Selegiline Oral': 10,
      'Selegiline Sublingual': 80,
      'Sinemet': 1, // levodopa+carbidopa
      'Sinemet CR': 0.75,
      'Stalevo': 1.33,
    };

    const conversionFactor = LEDD_CONVERSION_FACTORS[drugName.trim()] || 1.0;

    // Create new medication reference
    medication = this.medicationReferenceRepository.create({
      drug_name: drugName.trim(),
      led_conversion_factor: conversionFactor,
      active: true,
    });

    return await this.medicationReferenceRepository.save(medication);
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
    const smoked_before = is_current_smoker
      ? true
      : this.normalizeYesNoBoolean(dto.fumouAntes);

    // Create or update patient
    if (patient) {
      // Update existing patient - also update CPF if it's missing
      const updateData: any = {
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
        smoked_before,
        deficiencia_visual: dto.deficienciaVisual === 'Sim',
        hoarseness: dto.rouquidao === 'Sim',
        stuttering: dto.gagueja === 'Sim',
      };
      
      // Update CPF if it's missing (for existing patients that don't have it)
      if (!patient.cpf) {
        updateData.cpf = cpf;
      }
      
      await this.patientsService.update(patient.id, updateData);
      // Reload patient to get updated data - relations are eager loaded in entity
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
        smoked_before,
        deficiencia_visual: dto.deficienciaVisual === 'Sim',
        hoarseness: dto.rouquidao === 'Sim',
        stuttering: dto.gagueja === 'Sim',
      });
    }

    // Find or create questionnaire for this patient
    // REGRA: Um paciente pode ter apenas UM questionário (independente do avaliador)
    let questionnaire: Questionnaire | null = null;

    // If questionnaireId is provided, try to find that specific questionnaire first
    if (dto.questionnaireId) {
      questionnaire = await this.questionnairesRepository.findOne({
        where: { id: dto.questionnaireId },
      });

      // Verify that the questionnaire belongs to this patient
      if (questionnaire && questionnaire.patient_id === patient.id) {
        // Update existing questionnaire (even if it's completed, we're editing it)
        questionnaire.collection_date = new Date(dto.dataColeta);
        questionnaire.status = 'in_progress';
        questionnaire.last_step = 1;
        // Atualizar avaliador caso tenha mudado
        questionnaire.evaluator_id = evaluatorId;
        questionnaire = await this.questionnairesRepository.save(questionnaire);
      } else {
        // Invalid questionnaireId or doesn't belong to this patient
        questionnaire = null;
      }
    }

    // If no questionnaire found by ID, look for ANY questionnaire for this patient
    // (independente do status ou avaliador - apenas um questionário por paciente)
    if (!questionnaire) {
      questionnaire = await this.questionnairesRepository.findOne({
        where: {
          patient_id: patient.id,
        },
        order: { created_at: 'DESC' },
      });
    }

    if (!questionnaire) {
      // Create new questionnaire (primeiro questionário do paciente)
      questionnaire = this.questionnairesRepository.create({
        patient_id: patient.id,
        evaluator_id: evaluatorId,
        collection_date: new Date(dto.dataColeta),
        status: 'in_progress',
        last_step: 1,
      });
      questionnaire = await this.questionnairesRepository.save(questionnaire);
    } else if (!dto.questionnaireId) {
      // Update existing questionnaire (only if we didn't already update it above)
      questionnaire.collection_date = new Date(dto.dataColeta);
      questionnaire.status = 'in_progress';
      questionnaire.last_step = 1;
      // Atualizar avaliador caso tenha mudado
      questionnaire.evaluator_id = evaluatorId;
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
        abdominal_circumference_cm: dto.abdominal ? parseFloat(String(dto.abdominal)) : null,
      });
    } else {
      anthropometricData.weight_kg = dto.weight ? parseFloat(String(dto.weight)) : anthropometricData.weight_kg;
      anthropometricData.height_cm = dto.height ? parseFloat(String(dto.height)) : anthropometricData.height_cm;
      anthropometricData.waist_circumference_cm = dto.waistSize ? parseFloat(String(dto.waistSize)) : anthropometricData.waist_circumference_cm;
      anthropometricData.hip_circumference_cm = dto.hipSize ? parseFloat(String(dto.hipSize)) : anthropometricData.hip_circumference_cm;
      anthropometricData.abdominal_circumference_cm = dto.abdominal ? parseFloat(String(dto.abdominal)) : anthropometricData.abdominal_circumference_cm;
    }

    // Update questionnaire last_step to 2
    questionnaire.last_step = 2;
    await this.questionnairesRepository.save(questionnaire);

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

    // Map Hoehn-Yahr scale to ID
    let hoehnYahrStageId: number | null = null;
    if (dto.scaleHY) {
      const stage = parseFloat(dto.scaleHY);
      const hoehnYahr = await this.hoehnYahrScaleRepository.findOne({
        where: { stage },
      });
      hoehnYahrStageId = hoehnYahr?.id || null;
    }

    // Map Schwab & England score
    const schwabEnglandScore = dto.scaleSE ? parseInt(dto.scaleSE, 10) : null;

    // Parse family case
    const has_family_history = dto.familyCase === 'Sim';

    // Map phenotype to ID
    let phenotype_id: number | null = null;
    if (dto.mainPhenotype) {
      const phenotype = await this.parkinsonPhenotypeRepository.findOne({
        where: { description: dto.mainPhenotype },
      });
      phenotype_id = phenotype?.id || null;
    }

    // Map dyskinesia type to ID
    let dyskinesia_type_id: number | null = null;
    if (dto.fogClassifcation) {
      const dyskinesiaType = await this.dyskinesiaTypeRepository.findOne({
        where: { description: dto.fogClassifcation },
      });
      dyskinesia_type_id = dyskinesiaType?.id || null;
    }

    // Parse average ON time hours
    const average_on_time_hours = dto.durationWearingOff 
      ? this.parseSmokingDuration(dto.durationWearingOff) 
      : null;

    // Parse L-Dopa onset time hours
    const ldopa_onset_time_hours = dto.durationLDopa
      ? this.parseSmokingDuration(dto.durationLDopa)
      : null;

    // Normalize affected side to match database constraint
    const normalizedAffectedSide = this.normalizeAffectedSide(dto.parkinsonSide);

    // Map surgery data
    const has_surgery_history = dto.surgery === 'Sim';
    const surgery_year = dto.surgerrYear ? parseInt(dto.surgerrYear, 10) : null;
    let surgery_type_id: number | null = null;
    if (dto.surgeryType) {
      const surgeryType = await this.surgeryTypeRepository.findOne({
        where: { description: dto.surgeryType },
      });
      surgery_type_id = surgeryType?.id || null;
    }

    if (!clinicalAssessment) {
      clinicalAssessment = this.clinicalAssessmentRepository.create({
        questionnaire_id: dto.questionnaireId,
        diagnostic_description: dto.diagnosticDescription || '',
        age_at_onset: dto.onsetAge ? parseInt(String(dto.onsetAge), 10) : null,
        initial_symptom: dto.initialSympton,
        affected_side: normalizedAffectedSide,
        phenotype_id: phenotype_id,
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
        has_surgery_history,
        surgery_year,
        surgery_type_id,
        surgery_target: dto.surgeryTarget,
        disease_evolution: dto.evolution,
        current_symptoms: dto.symptom,
      });
    } else {
      clinicalAssessment.diagnostic_description = dto.diagnosticDescription || clinicalAssessment.diagnostic_description;
      clinicalAssessment.age_at_onset = dto.onsetAge ? parseInt(String(dto.onsetAge), 10) : clinicalAssessment.age_at_onset;
      clinicalAssessment.initial_symptom = dto.initialSympton || clinicalAssessment.initial_symptom;
      clinicalAssessment.affected_side = normalizedAffectedSide !== null ? normalizedAffectedSide : clinicalAssessment.affected_side;
      clinicalAssessment.phenotype_id = phenotype_id !== null ? phenotype_id : clinicalAssessment.phenotype_id;
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
      clinicalAssessment.dyskinesia_type_id = dyskinesia_type_id !== null ? dyskinesia_type_id : clinicalAssessment.dyskinesia_type_id;
      clinicalAssessment.comorbidities = dto.comorbidities || clinicalAssessment.comorbidities;
      clinicalAssessment.other_medications = dto.otherMedications || clinicalAssessment.other_medications;
      clinicalAssessment.has_surgery_history = has_surgery_history;
      clinicalAssessment.surgery_year = surgery_year !== null ? surgery_year : clinicalAssessment.surgery_year;
      clinicalAssessment.surgery_type_id = surgery_type_id !== null ? surgery_type_id : clinicalAssessment.surgery_type_id;
      clinicalAssessment.surgery_target = dto.surgeryTarget || clinicalAssessment.surgery_target;
      clinicalAssessment.disease_evolution = dto.evolution || clinicalAssessment.disease_evolution;
      clinicalAssessment.current_symptoms = dto.symptom || clinicalAssessment.current_symptoms;
    }

    const savedClinicalAssessment = await this.clinicalAssessmentRepository.save(clinicalAssessment);

    // Save medications if provided
    if (dto.medications && Array.isArray(dto.medications) && dto.medications.length > 0) {
      // First, remove existing medications for this questionnaire
      await this.patientMedicationRepository.delete({
        questionnaire_id: dto.questionnaireId,
      });

      // Save each medication
      for (const medDto of dto.medications) {
        if (!medDto.drug || !medDto.doseMg || medDto.doseMg <= 0) {
          continue; // Skip invalid medications
        }

        try {
          // Get or create medication reference
          const medicationRef = await this.getOrCreateMedicationReference(medDto.drug);

          // Calculate doses_per_day (default to 1 if not provided)
          const dosesPerDay = medDto.qtDose && medDto.qtDose > 0 ? medDto.qtDose : 1;

          // Create patient medication
          const patientMedication = this.patientMedicationRepository.create({
            questionnaire_id: dto.questionnaireId,
            medication_id: medicationRef.id,
            dose_mg: parseFloat(String(medDto.doseMg)),
            doses_per_day: dosesPerDay,
            led_conversion_factor: medicationRef.led_conversion_factor,
          });

          await this.patientMedicationRepository.save(patientMedication);
        } catch (error) {
          console.error(`Error saving medication ${medDto.drug}:`, error);
          // Continue with other medications even if one fails
        }
      }
    }

    // Update questionnaire last_step to 3
    questionnaire.last_step = 3;
    await this.questionnairesRepository.save(questionnaire);

    return savedClinicalAssessment;
  }

  /**
   * Save UPDRS-III scores (Step 4 - Avaliação Neurológica)
   */
  async saveUpdrs3Scores(dto: SaveUpdrs3Dto) {
    const questionnaire = await this.questionnairesRepository.findOne({
      where: { id: dto.questionnaireId },
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${dto.questionnaireId} not found`);
    }

    let updrsScore = await this.updrs3Repository.findOne({
      where: { questionnaire_id: dto.questionnaireId },
    });

    if (!updrsScore) {
      updrsScore = this.updrs3Repository.create({
        questionnaire_id: dto.questionnaireId,
      });
    }

    this.assignScoreFields(updrsScore, dto, UPDRS_SCORE_FIELDS);

    const saved = await this.updrs3Repository.save(updrsScore);

    // Update questionnaire last_step to 4
    questionnaire.last_step = 4;
    await this.questionnairesRepository.save(questionnaire);

    return {
      questionnaireId: saved.questionnaire_id,
      totalScore: saved.total_score ?? null,
    };
  }

  /**
   * Save MEEM scores
   */
  async saveMeemScores(dto: SaveMeemDto) {
    const questionnaire = await this.questionnairesRepository.findOne({
      where: { id: dto.questionnaireId },
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${dto.questionnaireId} not found`);
    }

    let meemScore = await this.meemRepository.findOne({
      where: { questionnaire_id: dto.questionnaireId },
    });

    if (!meemScore) {
      meemScore = this.meemRepository.create({
        questionnaire_id: dto.questionnaireId,
      });
    }

    this.assignScoreFields(meemScore, dto, MEEM_SCORE_FIELDS);

    const saved = await this.meemRepository.save(meemScore);

    // Update questionnaire last_step to 4 (Avaliação Neurológica)
    questionnaire.last_step = 4;
    await this.questionnairesRepository.save(questionnaire);

    return {
      questionnaireId: saved.questionnaire_id,
      totalScore: saved.total_score ?? null,
    };
  }

  /**
   * Save UDysRS scores
   */
  async saveUdysrsScores(dto: SaveUdysrsDto) {
    const questionnaire = await this.questionnairesRepository.findOne({
      where: { id: dto.questionnaireId },
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${dto.questionnaireId} not found`);
    }

    let udysrsScore = await this.udysrsRepository.findOne({
      where: { questionnaire_id: dto.questionnaireId },
    });

    if (!udysrsScore) {
      udysrsScore = this.udysrsRepository.create({
        questionnaire_id: dto.questionnaireId,
      });
    }

    this.assignScoreFields(udysrsScore, dto, UDYSRS_SCORE_FIELDS);

    const saved = await this.udysrsRepository.save(udysrsScore);

    // Update questionnaire last_step to 4 (Avaliação Neurológica)
    questionnaire.last_step = 4;
    await this.questionnairesRepository.save(questionnaire);

    return {
      questionnaireId: saved.questionnaire_id,
      historicalSubscore: saved.historical_subscore ?? null,
      objectiveSubscore: saved.objective_subscore ?? null,
      totalScore: saved.total_score ?? null,
    };
  }

  /**
   * Save STOP-Bang screening
   */
  async saveStopbangScores(dto: SaveStopbangDto) {
    const questionnaire = await this.questionnairesRepository.findOne({
      where: { id: dto.questionnaireId },
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${dto.questionnaireId} not found`);
    }

    let stopbangScore = await this.stopbangRepository.findOne({
      where: { questionnaire_id: dto.questionnaireId },
    });

    if (!stopbangScore) {
      stopbangScore = this.stopbangRepository.create({
        questionnaire_id: dto.questionnaireId,
      });
    }

    this.assignScoreFields(stopbangScore, dto, STOPBANG_SCORE_FIELDS);

    const saved = await this.stopbangRepository.save(stopbangScore);

    // Update questionnaire last_step to 6 (Avaliação do Sono)
    questionnaire.last_step = 6;
    await this.questionnairesRepository.save(questionnaire);

    return {
      questionnaireId: saved.questionnaire_id,
      totalScore: saved.total_score ?? null,
    };
  }

  /**
   * Save Epworth Sleepiness Scale
   */
  async saveEpworthScores(dto: SaveEpworthDto) {
    const questionnaire = await this.questionnairesRepository.findOne({
      where: { id: dto.questionnaireId },
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${dto.questionnaireId} not found`);
    }

    let epworthScore = await this.epworthRepository.findOne({
      where: { questionnaire_id: dto.questionnaireId },
    });

    if (!epworthScore) {
      epworthScore = this.epworthRepository.create({
        questionnaire_id: dto.questionnaireId,
      });
    }

    this.assignScoreFields(epworthScore, dto, EPWORTH_SCORE_FIELDS);

    const saved = await this.epworthRepository.save(epworthScore);

    // Update questionnaire last_step to 6 (Avaliação do Sono)
    questionnaire.last_step = 6;
    await this.questionnairesRepository.save(questionnaire);

    return {
      questionnaireId: saved.questionnaire_id,
      totalScore: saved.total_score ?? null,
    };
  }

  /**
   * Save PDSS-2 responses
   */
  async savePdss2Scores(dto: SavePdss2Dto) {
    const questionnaire = await this.questionnairesRepository.findOne({
      where: { id: dto.questionnaireId },
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${dto.questionnaireId} not found`);
    }

    let pdssScore = await this.pdss2Repository.findOne({
      where: { questionnaire_id: dto.questionnaireId },
    });

    if (!pdssScore) {
      pdssScore = this.pdss2Repository.create({
        questionnaire_id: dto.questionnaireId,
      });
    }

    this.assignScoreFields(pdssScore, dto, PDSS2_SCORE_FIELDS);

    const saved = await this.pdss2Repository.save(pdssScore);

    // Update questionnaire last_step to 6 (Avaliação do Sono)
    questionnaire.last_step = 6;
    await this.questionnairesRepository.save(questionnaire);

    return {
      questionnaireId: saved.questionnaire_id,
      totalScore: saved.total_score ?? null,
    };
  }

  /**
   * Save RBDSQ questionnaire
   */
  async saveRbdsqScores(dto: SaveRbdsqDto) {
    const questionnaire = await this.questionnairesRepository.findOne({
      where: { id: dto.questionnaireId },
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${dto.questionnaireId} not found`);
    }

    let rbdsqScore = await this.rbdsqRepository.findOne({
      where: { questionnaire_id: dto.questionnaireId },
    });

    if (!rbdsqScore) {
      rbdsqScore = this.rbdsqRepository.create({
        questionnaire_id: dto.questionnaireId,
      });
    }

    this.assignScoreFields(rbdsqScore, dto, RBDSQ_SCORE_FIELDS);

    const saved = await this.rbdsqRepository.save(rbdsqScore);

    // Update questionnaire last_step to 6 (Avaliação do Sono)
    questionnaire.last_step = 6;
    await this.questionnairesRepository.save(questionnaire);

    return {
      questionnaireId: saved.questionnaire_id,
      totalScore: saved.total_score ?? null,
    };
  }

  /**
   * Save FOGQ scores
   */
  async saveFogqScores(dto: SaveFogqDto) {
    const questionnaire = await this.questionnairesRepository.findOne({
      where: { id: dto.questionnaireId },
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${dto.questionnaireId} not found`);
    }

    let fogqScore = await this.fogqRepository.findOne({
      where: { questionnaire_id: dto.questionnaireId },
    });

    if (!fogqScore) {
      fogqScore = this.fogqRepository.create({
        questionnaire_id: dto.questionnaireId,
      });
    }

    this.assignScoreFields(fogqScore, dto, FOGQ_SCORE_FIELDS);

    const saved = await this.fogqRepository.save(fogqScore);

    // Update questionnaire last_step to 7 (Avaliação Fisioterápica)
    questionnaire.last_step = 7;
    await this.questionnairesRepository.save(questionnaire);

    return {
      questionnaireId: saved.questionnaire_id,
      totalScore: saved.total_score ?? null,
    };
  }

  /**
   * Get all reference data for questionnaire forms
   */
  async getReferenceData() {
    const [genders, ethnicities, educationLevels, maritalStatuses, incomeRanges, phenotypes, dyskinesiaTypes] = await Promise.all([
      this.genderTypeRepository.find({ where: { active: true }, order: { id: 'ASC' } }),
      this.ethnicityTypeRepository.find({ where: { active: true }, order: { id: 'ASC' } }),
      this.educationLevelRepository.find({ where: { active: true }, order: { id: 'ASC' } }),
      this.maritalStatusTypeRepository.find({ where: { active: true }, order: { id: 'ASC' } }),
      this.incomeRangeRepository.find({ where: { active: true }, order: { id: 'ASC' } }),
      this.parkinsonPhenotypeRepository.find({ where: { active: true }, order: { id: 'ASC' } }),
      this.dyskinesiaTypeRepository.find({ order: { id: 'ASC' } }),
    ]);

    return {
      genders: genders.map(g => ({ value: g.code, label: g.description, code: g.code, description: g.description })),
      ethnicities: ethnicities.map(e => ({ value: e.description, label: e.description })),
      educationLevels: educationLevels.map(el => ({ value: el.description, label: el.description })),
      maritalStatuses: maritalStatuses.map(ms => ({ value: ms.description, label: ms.description })),
      incomeRanges: incomeRanges.map(ir => ({ value: ir.code, label: ir.description })),
      phenotypes: phenotypes.map(p => ({ value: p.description, label: p.description })),
      dyskinesiaTypes: dyskinesiaTypes.map(dt => ({ value: dt.description, label: dt.description })),
      affectedSides: [
        { value: 'Direito', label: 'Direito' },
        { value: 'Esquerdo', label: 'Esquerdo' },
        { value: 'Bilateral', label: 'Bilateral' },
        { value: 'Não especificado', label: 'Não especificado' },
      ],
    };
  }

  /**
   * Search questionnaires by patient name or CPF (optimized for listing)
   * Returns only basic data needed for the search results page
   */
  async searchQuestionnaires(term?: string) {
    const queryBuilder = this.questionnairesRepository
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.patient', 'patient')
      .select([
        'q.id',
        'q.status',
        'q.created_at',
        'q.updated_at',
        'q.completed_at',
        'q.collection_date',
        'patient.id',
        'patient.full_name',
        'patient.cpf',
        'patient.cpf_hash',
      ])
      .orderBy('q.created_at', 'DESC')
      .limit(100); // Limitar resultados para melhor performance

    if (term && term.trim() !== '') {
      const termLower = term.toLowerCase().trim();
      const termDigits = term.replace(/\D/g, '');
      
      // Se o termo tem dígitos, pode ser CPF - gerar hash e buscar
      if (termDigits.length > 0) {
        try {
          const cpfHash = CryptoUtil.hashCpf(termDigits);
          queryBuilder.where(
            '(LOWER(patient.full_name) LIKE :term OR patient.cpf_hash = :cpfHash)',
            { term: `%${termLower}%`, cpfHash }
          );
        } catch (error) {
          // Se falhar ao gerar hash, busca apenas por nome
          queryBuilder.where('LOWER(patient.full_name) LIKE :term', {
            term: `%${termLower}%`,
          });
        }
      } else {
        // Apenas busca por nome
        queryBuilder.where('LOWER(patient.full_name) LIKE :term', {
          term: `%${termLower}%`,
        });
      }
    }

    const questionnaires = await queryBuilder.getMany();
    
    // Retornar apenas dados básicos para a listagem
    return questionnaires.map(q => ({
      id: q.id,
      fullName: q.patient?.full_name || '',
      cpf: q.patient?.cpf || '', // CPF em texto para exibição nas telas
      cpfHash: q.patient?.cpf_hash || '', // Hash do CPF para exportações
      createdAt: q.created_at,
      updatedAt: q.updated_at,
      completedAt: q.completed_at,
      status: q.status,
      data: null, // Dados completos serão carregados apenas quando necessário
    }));
  }

  /**
   * Get questionnaire by ID with all related data
   */
  async getQuestionnaireById(id: string) {
    const questionnaire = await this.questionnairesRepository
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.patient', 'patient')
      .leftJoinAndSelect('patient.gender', 'gender')
      .leftJoinAndSelect('patient.ethnicity', 'ethnicity')
      .leftJoinAndSelect('patient.education_level', 'education_level')
      .leftJoinAndSelect('patient.marital_status', 'marital_status')
      .leftJoinAndSelect('patient.income_range', 'income_range')
      .leftJoinAndSelect('q.evaluator', 'evaluator')
      .leftJoinAndSelect('q.anthropometric_data', 'anthropometric_data')
      .leftJoinAndSelect('q.clinical_assessment', 'clinical_assessment')
      .leftJoinAndSelect('q.medications', 'medications')
      .leftJoinAndSelect('q.stopbang_score', 'stopbang_score')
      .leftJoinAndSelect('q.epworth_score', 'epworth_score')
      .leftJoinAndSelect('q.pdss2_score', 'pdss2_score')
      .leftJoinAndSelect('q.rbdsq_score', 'rbdsq_score')
      .leftJoinAndSelect('q.fogq_score', 'fogq_score')
      .leftJoinAndSelect('q.pdf_reports', 'pdf_reports')
      .leftJoinAndSelect('q.updrs3_score', 'updrs3_score')
      .leftJoinAndSelect('q.meem_score', 'meem_score')
      .leftJoinAndSelect('q.udysrs_score', 'udysrs_score')
      // NÃO usar leftJoinAndSelect para binary_collections aqui - vamos carregar manualmente depois
      // .leftJoinAndSelect('q.binary_collections', 'binary_collections')
      // .leftJoinAndSelect('binary_collections.active_task', 'active_task')
      .where('q.id = :id', { id })
      .getOne();

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${id} not found`);
    }

    // Debug: verificar se patient foi carregado
    console.log('🔍 Questionnaire loaded:', {
      id: questionnaire.id,
      hasPatient: !!questionnaire.patient,
      patientId: questionnaire.patient_id,
      patientCpfHash: questionnaire.patient?.cpf_hash ? questionnaire.patient.cpf_hash.substring(0, 8) + '...' : 'N/A',
    });

    // Carregar medicamentos e binary_collections em paralelo para melhor performance
    const [medications, patientCpfHash] = await Promise.all([
      // Carregar medicamentos
      this.patientMedicationRepository
        .createQueryBuilder('pm')
        .where('pm.questionnaire_id = :questionnaireId', { questionnaireId: id })
        .getMany()
        .catch(() => []),
      // Obter patient_cpf_hash (já está carregado no patient)
      Promise.resolve(questionnaire.patient?.cpf_hash || null)
    ]);

    questionnaire.medications = medications || [];

    // Carregar binary_collections de forma otimizada
    questionnaire.binary_collections = [];
    
    if (patientCpfHash) {
      try {
        // Query única otimizada: buscar por questionnaire_id OU patient_cpf_hash
        // Não carregar csv_data (BYTEA) para melhorar performance
        const allBinaryCollections = await this.binaryCollectionRepository
          .createQueryBuilder('bc')
          .leftJoinAndSelect('bc.active_task', 'active_task')
          .select([
            'bc.id',
            'bc.patient_cpf_hash',
            'bc.repetitions_count',
            'bc.task_id',
            'bc.questionnaire_id',
            'bc.file_size_bytes',
            'bc.file_checksum',
            'bc.collection_type',
            'bc.device_type',
            'bc.device_serial',
            'bc.sampling_rate_hz',
            'bc.collected_at',
            'bc.uploaded_at',
            'bc.metadata',
            'bc.processing_status',
            'bc.processing_error',
            'bc.created_by',
            'active_task.id',
            'active_task.task_code',
            'active_task.task_name',
            'active_task.task_description',
          ])
          .where('bc.questionnaire_id = :questionnaireId OR bc.patient_cpf_hash = :patientCpfHash', {
            questionnaireId: id,
            patientCpfHash,
          })
          .orderBy('bc.collected_at', 'DESC')
          .getMany();
        
        // Remover duplicatas baseado no ID
        const uniqueCollections = Array.from(
          new Map(allBinaryCollections.map(bc => [bc.id, bc])).values()
        );
        
        questionnaire.binary_collections = uniqueCollections;
      } catch (error) {
        console.error('Error loading binary collections:', error);
        questionnaire.binary_collections = [];
      }
    }

    return await this.formatQuestionnaireForFrontend(questionnaire);
  }

  /**
   * Format questionnaire data for frontend consumption
   */
  private async formatQuestionnaireForFrontend(questionnaire: Questionnaire) {
    // Patient relations já estão carregadas via leftJoinAndSelect na query principal
    const patient = questionnaire.patient;
    
    const anthropometric = questionnaire.anthropometric_data;
    const clinical = questionnaire.clinical_assessment;
    // Carregar medicamentos da tabela patient_medications
    // Garantir que os medicamentos estão disponíveis (já foram carregados no getQuestionnaireById)
    const medications = questionnaire.medications || [];
    
    console.log('Formatting medications - count:', medications.length);
    if (medications.length > 0) {
      console.log('First medication raw data:', {
        medication_id: medications[0].medication_id,
        dose_mg: medications[0].dose_mg,
        doses_per_day: medications[0].doses_per_day,
        led_conversion_factor: medications[0].led_conversion_factor,
        type_dose_mg: typeof medications[0].dose_mg,
        type_doses_per_day: typeof medications[0].doses_per_day,
        type_led_conversion_factor: typeof medications[0].led_conversion_factor,
      });
    } else {
      console.log('No medications found for questionnaire:', questionnaire.id);
    }

    // Reconstruir dados do formulário no formato esperado pelo frontend
    const formData: any = {
      // Dados demográficos
      nomeAvaliador: questionnaire.evaluator?.full_name || '',
      dataColeta: questionnaire.collection_date
        ? new Date(questionnaire.collection_date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      fullName: patient.full_name,
      cpf: patient.cpf || '', // CPF armazenado em texto plano
      birthday: patient.date_of_birth
        ? new Date(patient.date_of_birth).toISOString().split('T')[0]
        : '',
      age: patient.date_of_birth
        ? String(
            new Date().getFullYear() -
              new Date(patient.date_of_birth).getFullYear()
          )
        : '',
      // Gender: frontend espera o code (M, F, OTHER)
      gender: patient.gender?.code || '',
      // Ethnicity: frontend espera a description
      etnia: patient.ethnicity?.description || '',
      nationality: patient.nationality || 'Brasileiro',
      // Education: frontend espera a description
      education: patient.education_level?.description || '',
      educationOther: patient.education_other || '',
      // Marital Status: frontend espera a description
      maritalStatus: patient.marital_status?.description || '',
      occupation: patient.occupation || '',
      phoneNumber: patient.phone_primary || '',
      phoneNumberContact: patient.phone_secondary || '',
      email: patient.email || '',
      fumaCase: patient.is_current_smoker ? 'Sim' : 'Não',
      fumouAntes:
        patient.smoked_before === true
          ? 'Sim'
          : patient.smoked_before === false
            ? 'Não'
            : patient.years_since_quit_smoking !== null && patient.years_since_quit_smoking !== undefined
              ? 'Sim'
              : patient.is_current_smoker
                ? 'Não'
                : '',
      smokingDuration: patient.smoking_duration_years
        ? String(patient.smoking_duration_years)
        : '',
      stoppedSmokingDuration: patient.years_since_quit_smoking
        ? String(patient.years_since_quit_smoking)
        : '',
      // Income Range: frontend espera o code
      rendaFamiliar: patient.income_range?.code || '',
      // Campos de saúde
      deficienciaVisual: patient.deficiencia_visual !== undefined && patient.deficiencia_visual !== null
        ? (patient.deficiencia_visual ? 'Sim' : 'Não')
        : '',
      rouquidao: patient.hoarseness !== undefined && patient.hoarseness !== null
        ? (patient.hoarseness ? 'Sim' : 'Não')
        : '',
      gagueja: patient.stuttering !== undefined && patient.stuttering !== null
        ? (patient.stuttering ? 'Sim' : 'Não')
        : '',
    };

    // Dados antropométricos
    if (anthropometric) {
      formData.weight = anthropometric.weight_kg
        ? String(anthropometric.weight_kg)
        : '';
      formData.height = anthropometric.height_cm
        ? String(anthropometric.height_cm)
        : '';
      formData.imc = anthropometric.bmi ? String(anthropometric.bmi) : '';
      formData.waistSize = anthropometric.waist_circumference_cm
        ? String(anthropometric.waist_circumference_cm)
        : '';
      formData.hipSize = anthropometric.hip_circumference_cm
        ? String(anthropometric.hip_circumference_cm)
        : '';
      formData.abdominal = anthropometric.abdominal_circumference_cm
        ? String(anthropometric.abdominal_circumference_cm)
        : '';
    }

    // Dados clínicos
    if (clinical) {
      formData.diagnosticDescription = clinical.diagnostic_description || '';
      formData.onsetAge = clinical.age_at_onset
        ? String(clinical.age_at_onset)
        : '';
      formData.parkinsonOnset = clinical.age_at_onset
        ? String(
            new Date().getFullYear() -
              new Date(patient.date_of_birth).getFullYear() -
              clinical.age_at_onset
          )
        : '0';
      formData.initialSympton = clinical.initial_symptom || '';
      // Lateralidade de início - garantir que está sendo mapeado corretamente
      formData.parkinsonSide = clinical.affected_side || '';
      formData.familyCase = clinical.has_family_history ? 'Sim' : 'Não';
      formData.kinshipDegree = clinical.family_kinship_degree || '';
      
      // Buscar phenotype
      if (clinical.phenotype_id) {
        const phenotype = await this.parkinsonPhenotypeRepository.findOne({
          where: { id: clinical.phenotype_id },
        });
        formData.mainPhenotype = phenotype?.description || '';
      } else {
        formData.mainPhenotype = '';
      }
      
      formData.levodopaOn = clinical.assessed_on_levodopa || false;
      formData.diskinectiaPresence = clinical.has_dyskinesia || false;
      formData.fog = clinical.has_freezing_of_gait || false;
      
      // Buscar dyskinesia type
      if (clinical.dyskinesia_type_id) {
        const dyskinesiaType = await this.dyskinesiaTypeRepository.findOne({
          where: { id: clinical.dyskinesia_type_id },
        });
        formData.fogClassifcation = dyskinesiaType?.description || '';
      } else {
        formData.fogClassifcation = '';
      }
      
      formData.wearingOff = clinical.has_wearing_off || false;
      formData.durationWearingOff = clinical.average_on_time_hours
        ? String(clinical.average_on_time_hours)
        : '';
      formData.DelayOn = clinical.has_delayed_on || false;
      formData.durationLDopa = clinical.ldopa_onset_time_hours
        ? String(clinical.ldopa_onset_time_hours)
        : '';
      
      // Buscar Hoehn-Yahr scale
      if (clinical.hoehn_yahr_stage_id) {
        const hoehnYahr = await this.hoehnYahrScaleRepository.findOne({
          where: { id: clinical.hoehn_yahr_stage_id },
        });
        formData.scaleHY = hoehnYahr?.stage ? String(hoehnYahr.stage) : '';
      } else {
        formData.scaleHY = '';
      }
      
      formData.scaleSE = clinical.schwab_england_score
        ? String(clinical.schwab_england_score)
        : '';
      formData.comorbidities = clinical.comorbidities || '';
      formData.otherMedications = clinical.other_medications || '';
      
      // Campos de cirurgia
      formData.surgery = clinical.has_surgery_history ? 'Sim' : 'Não';
      formData.surgerrYear = clinical.surgery_year ? String(clinical.surgery_year) : '';
      
      // Buscar surgery type
      if (clinical.surgery_type_id) {
        const surgeryType = await this.surgeryTypeRepository.findOne({
          where: { id: clinical.surgery_type_id },
        });
        formData.surgeryType = surgeryType?.description || '';
      } else {
        formData.surgeryType = '';
      }
      
      formData.surgeryTarget = clinical.surgery_target || '';
      formData.evolution = clinical.disease_evolution || '';
      formData.symptom = clinical.current_symptoms || '';
      formData.vitamins = ''; // Não há campo no banco para vitamins
    }

    // Medicações - buscar dados de referência da tabela patient_medications
    if (medications && medications.length > 0) {
      console.log('🔍 Processing medications - raw count:', medications.length);
      
      // Extrair IDs dos medicamentos (medication_id da tabela patient_medications)
      const medicationIds = medications
        .map(med => med.medication_id)
        .filter(id => id != null && id !== undefined);
      
      console.log('🔍 Medication IDs extracted:', medicationIds);
      
      // Buscar referências dos medicamentos na tabela medications_reference
      const medicationRefs = medicationIds.length > 0
        ? await this.medicationReferenceRepository.find({
            where: { id: In(medicationIds) },
          })
        : [];
      
      console.log('🔍 Medication references found:', medicationRefs.length);
      if (medicationRefs.length > 0) {
        console.log('🔍 Sample medication reference:', {
          id: medicationRefs[0].id,
          drug_name: medicationRefs[0].drug_name,
        });
      }
      
      // Criar mapa para acesso rápido
      const medicationMap = new Map(medicationRefs.map(ref => [ref.id, ref]));
      
      // Mapear medicamentos para o formato esperado pelo frontend
      formData.medications = medications.map(med => {
        const medRef = medicationMap.get(med.medication_id);
        // Converter valores decimais (podem vir como string do banco)
        const doseMg = typeof med.dose_mg === 'string' 
          ? parseFloat(med.dose_mg) 
          : Number(med.dose_mg) || 0;
        const dosesPerDay = typeof med.doses_per_day === 'string'
          ? parseInt(med.doses_per_day, 10)
          : Number(med.doses_per_day) || 0;
        const conversionFactor = typeof med.led_conversion_factor === 'string'
          ? parseFloat(med.led_conversion_factor)
          : Number(med.led_conversion_factor) || 0;
        
        // Calcular LED: dose_mg × led_conversion_factor × doses_per_day
        const ledValue = doseMg * conversionFactor * dosesPerDay;
        
        return {
          drug: medRef?.drug_name || '',
          doseMg: doseMg > 0 ? String(doseMg) : '',
          qtDose: dosesPerDay > 0 ? String(dosesPerDay) : '1',
          led: ledValue > 0 ? String(Math.round(ledValue)) : '0',
        };
      });

      // Calcular LED total (soma de todos os medicamentos)
      formData.leddResult = String(
        Math.round(
          medications.reduce(
            (sum, med) => {
              // Converter valores decimais (podem vir como string do banco)
              const doseMg = typeof med.dose_mg === 'string' 
                ? parseFloat(med.dose_mg) 
                : Number(med.dose_mg) || 0;
              const dosesPerDay = typeof med.doses_per_day === 'string'
                ? parseInt(med.doses_per_day, 10)
                : Number(med.doses_per_day) || 0;
              const conversionFactor = typeof med.led_conversion_factor === 'string'
                ? parseFloat(med.led_conversion_factor)
                : Number(med.led_conversion_factor) || 0;
              return sum + (doseMg * conversionFactor * dosesPerDay);
            },
            0
          )
        )
      );
    } else {
      // Inicializar array vazio se não houver medicamentos
      formData.medications = [];
      formData.leddResult = '0';
    }

    // Debug: verificar o que está sendo retornado
    console.log('FormData medications before return:', formData.medications?.length || 0);
    if (formData.medications && formData.medications.length > 0) {
      console.log('Sample formatted medication:', JSON.stringify(formData.medications[0], null, 2));
    }

    // Carregar protocolos do sono - STOP-Bang
    if (questionnaire.stopbang_score) {
      const stopbang = questionnaire.stopbang_score;
      formData.stopbang_snore = stopbang.snoring ?? '';
      formData.stopbang_tired = stopbang.tired ?? '';
      formData.stopbang_observed = stopbang.observed_apnea ?? '';
      formData.stopbang_pressure = stopbang.blood_pressure ?? '';
      formData.stopbang_age = stopbang.age_over_50 ?? '';
      formData.stopbang_neck = stopbang.neck_circumference_large ?? '';
      formData.stopbang_gender = stopbang.gender_male ?? '';
      formData.scoreStopBang = stopbang.total_score !== null ? String(stopbang.total_score) : '';
    }

    // Carregar protocolos do sono - Epworth
    if (questionnaire.epworth_score) {
      const epworth = questionnaire.epworth_score;
      formData.epworth_q1 = epworth.sitting_reading !== null && epworth.sitting_reading !== undefined ? String(epworth.sitting_reading) : '';
      formData.epworth_q2 = epworth.watching_tv !== null && epworth.watching_tv !== undefined ? String(epworth.watching_tv) : '';
      formData.epworth_q3 = epworth.sitting_inactive_public !== null && epworth.sitting_inactive_public !== undefined ? String(epworth.sitting_inactive_public) : '';
      formData.epworth_q4 = epworth.passenger_car !== null && epworth.passenger_car !== undefined ? String(epworth.passenger_car) : '';
      formData.epworth_q5 = epworth.lying_down_afternoon !== null && epworth.lying_down_afternoon !== undefined ? String(epworth.lying_down_afternoon) : '';
      formData.epworth_q6 = epworth.sitting_talking !== null && epworth.sitting_talking !== undefined ? String(epworth.sitting_talking) : '';
      formData.epworth_q7 = epworth.sitting_after_lunch !== null && epworth.sitting_after_lunch !== undefined ? String(epworth.sitting_after_lunch) : '';
      formData.epworth_q8 = epworth.car_stopped_traffic !== null && epworth.car_stopped_traffic !== undefined ? String(epworth.car_stopped_traffic) : '';
      formData.scoreEpworth = epworth.total_score !== null ? String(epworth.total_score) : '';
    }

    // Carregar protocolos do sono - PDSS-2
    if (questionnaire.pdss2_score) {
      const pdss2 = questionnaire.pdss2_score;
      formData.pdss2_q1 = pdss2.q1 !== null && pdss2.q1 !== undefined ? String(pdss2.q1) : '';
      formData.pdss2_q2 = pdss2.q2 !== null && pdss2.q2 !== undefined ? String(pdss2.q2) : '';
      formData.pdss2_q3 = pdss2.q3 !== null && pdss2.q3 !== undefined ? String(pdss2.q3) : '';
      formData.pdss2_q4 = pdss2.q4 !== null && pdss2.q4 !== undefined ? String(pdss2.q4) : '';
      formData.pdss2_q5 = pdss2.q5 !== null && pdss2.q5 !== undefined ? String(pdss2.q5) : '';
      formData.pdss2_q6 = pdss2.q6 !== null && pdss2.q6 !== undefined ? String(pdss2.q6) : '';
      formData.pdss2_q7 = pdss2.q7 !== null && pdss2.q7 !== undefined ? String(pdss2.q7) : '';
      formData.pdss2_q8 = pdss2.q8 !== null && pdss2.q8 !== undefined ? String(pdss2.q8) : '';
      formData.pdss2_q9 = pdss2.q9 !== null && pdss2.q9 !== undefined ? String(pdss2.q9) : '';
      formData.pdss2_q10 = pdss2.q10 !== null && pdss2.q10 !== undefined ? String(pdss2.q10) : '';
      formData.pdss2_q11 = pdss2.q11 !== null && pdss2.q11 !== undefined ? String(pdss2.q11) : '';
      formData.pdss2_q12 = pdss2.q12 !== null && pdss2.q12 !== undefined ? String(pdss2.q12) : '';
      formData.pdss2_q13 = pdss2.q13 !== null && pdss2.q13 !== undefined ? String(pdss2.q13) : '';
      formData.pdss2_q14 = pdss2.q14 !== null && pdss2.q14 !== undefined ? String(pdss2.q14) : '';
      formData.pdss2_q15 = pdss2.q15 !== null && pdss2.q15 !== undefined ? String(pdss2.q15) : '';
      formData.scorePDSS2 = pdss2.total_score !== null ? String(pdss2.total_score) : '';
    }

    // Carregar protocolos do sono - RBDSQ
    if (questionnaire.rbdsq_score) {
      const rbdsq = questionnaire.rbdsq_score;
      formData.q1RBDSQ = rbdsq.q1_vivid_dreams !== null && rbdsq.q1_vivid_dreams !== undefined ? (rbdsq.q1_vivid_dreams ? '1' : '0') : '';
      formData.q2RBDSQ = rbdsq.q2_aggressive_content !== null && rbdsq.q2_aggressive_content !== undefined ? (rbdsq.q2_aggressive_content ? '1' : '0') : '';
      formData.q3RBDSQ = rbdsq.q3_dream_enactment !== null && rbdsq.q3_dream_enactment !== undefined ? (rbdsq.q3_dream_enactment ? '1' : '0') : '';
      formData.q4RBDSQ = rbdsq.q4_limb_movements !== null && rbdsq.q4_limb_movements !== undefined ? (rbdsq.q4_limb_movements ? '1' : '0') : '';
      formData.q5RBDSQ = rbdsq.q5_injury_potential !== null && rbdsq.q5_injury_potential !== undefined ? (rbdsq.q5_injury_potential ? '1' : '0') : '';
      formData.q6RBDSQ = rbdsq.q6_bed_disruption !== null && rbdsq.q6_bed_disruption !== undefined ? (rbdsq.q6_bed_disruption ? '1' : '0') : '';
      formData.q7RBDSQ = rbdsq.q7_awakening_recall !== null && rbdsq.q7_awakening_recall !== undefined ? (rbdsq.q7_awakening_recall ? '1' : '0') : '';
      formData.q8RBDSQ = rbdsq.q8_sleep_disruption !== null && rbdsq.q8_sleep_disruption !== undefined ? (rbdsq.q8_sleep_disruption ? '1' : '0') : '';
      formData.q9RBDSQ = rbdsq.q9_neurological_disorder !== null && rbdsq.q9_neurological_disorder !== undefined ? (rbdsq.q9_neurological_disorder ? '1' : '0') : '';
      formData.q10RBDSQ = rbdsq.q10_rem_behavior_problem !== null && rbdsq.q10_rem_behavior_problem !== undefined ? (rbdsq.q10_rem_behavior_problem ? '1' : '0') : '';
      formData.scoreRBDSQ = rbdsq.total_score !== null ? String(rbdsq.total_score) : '';
    }

    // Carregar FOGQ
    if (questionnaire.fogq_score) {
      const fogq = questionnaire.fogq_score;
      // Os dados do FOGQ são armazenados no estado fogq, não no formData diretamente
      // Mas vamos adicionar ao formData para referência
      formData.scoreFOGQ = fogq.total_score !== null ? String(fogq.total_score) : '';
    }

    const updrsScoreData = this.extractScoreData(
      questionnaire.updrs3_score,
      UPDRS_SCORE_FIELDS,
      ['total_score'],
    );
    if (updrsScoreData) {
      formData.updrs3Scores = updrsScoreData;
      if (updrsScoreData.total_score !== null && updrsScoreData.total_score !== undefined) {
        formData.scoreUPDRS3 = String(updrsScoreData.total_score);
      }
    }

    const meemScoreData = this.extractScoreData(
      questionnaire.meem_score,
      MEEM_SCORE_FIELDS,
      ['total_score'],
    );
    if (meemScoreData) {
      formData.meemScores = meemScoreData;
      if (meemScoreData.total_score !== null && meemScoreData.total_score !== undefined) {
        formData.scoreMEEN = String(meemScoreData.total_score);
      }
    }

    const udysrsScoreData = this.extractScoreData(
      questionnaire.udysrs_score,
      UDYSRS_SCORE_FIELDS,
      ['historical_subscore', 'objective_subscore', 'total_score'],
    );
    if (udysrsScoreData) {
      formData.udysrsScores = udysrsScoreData;
      if (udysrsScoreData.total_score !== null && udysrsScoreData.total_score !== undefined) {
        formData.scoreUDRS = String(udysrsScoreData.total_score);
      }
    }

    const pdfReports = Array.isArray(questionnaire.pdf_reports)
      ? questionnaire.pdf_reports.map((report) => ({
          id: report.id,
          reportType: report.report_type,
          fileName: report.file_name,
          fileSizeBytes: report.file_size_bytes,
          uploadedAt: report.uploaded_at,
          notes: report.notes,
        }))
      : [];

    if (pdfReports.length > 0) {
      const polysomnographyReport = pdfReports.find(
        (report) => report.reportType === 'POLYSOMNOGRAPHY',
      );
      if (polysomnographyReport) {
        formData.polissonografoPdfReportId = polysomnographyReport.id;
        formData.polissonografoPdfFileName = polysomnographyReport.fileName;
      } else {
        formData.polissonografoPdfReportId = '';
        formData.polissonografoPdfFileName = '';
      }

      const biobitReport = pdfReports.find((report) => report.reportType === 'BIOBIT');
      if (biobitReport) {
        formData.biobitPdfReportId = biobitReport.id;
        formData.biobitPdfFileName = biobitReport.fileName;
      } else {
        formData.biobitPdfReportId = '';
        formData.biobitPdfFileName = '';
      }

      const delsysReport = pdfReports.find((report) => report.reportType === 'DELSYS');
      if (delsysReport) {
        formData.delsysPdfReportId = delsysReport.id;
        formData.delsysPdfFileName = delsysReport.fileName;
      } else {
        formData.delsysPdfReportId = '';
        formData.delsysPdfFileName = '';
      }
    } else {
      formData.polissonografoPdfReportId = '';
      formData.polissonografoPdfFileName = '';
      formData.biobitPdfReportId = '';
      formData.biobitPdfFileName = '';
      formData.delsysPdfReportId = '';
      formData.delsysPdfFileName = '';
    }

    // Processar binary collections para retornar apenas informações essenciais
    console.log('🔍 formatQuestionnaireForFrontend - binary_collections ANTES de processar:', {
      hasBinaryCollections: !!questionnaire.binary_collections,
      isArray: Array.isArray(questionnaire.binary_collections),
      rawCount: questionnaire.binary_collections?.length || 0,
      type: typeof questionnaire.binary_collections,
      questionnaireId: questionnaire.id,
      sample: questionnaire.binary_collections?.[0] || null,
    });
    
    const binaryCollections = Array.isArray(questionnaire.binary_collections)
      ? questionnaire.binary_collections.map((bc) => ({
          id: bc.id,
          task_id: bc.task_id,
          repetitions_count: bc.repetitions_count,
          collected_at: bc.collected_at,
          active_task: bc.active_task ? {
            task_code: bc.active_task.task_code,
            task_name: bc.active_task.task_name,
          } : null,
        }))
      : [];
    
    console.log('🔍 formatQuestionnaireForFrontend - binaryCollections DEPOIS de processar:', {
      count: binaryCollections.length,
      sample: binaryCollections[0] || null,
    });

    return {
      id: questionnaire.id,
      fullName: patient.full_name,
      cpf: patient.cpf || '', // CPF em texto para exibição nas telas
      cpfHash: patient.cpf_hash || '', // Hash do CPF para exportações
      status: questionnaire.status,
      lastStep: questionnaire.last_step || 1, // Último passo salvo
      createdAt: questionnaire.created_at.toISOString().split('T')[0],
      updatedAt: questionnaire.updated_at.toISOString().split('T')[0],
      completedAt: questionnaire.completed_at
        ? questionnaire.completed_at.toISOString().split('T')[0]
        : null,
      data: {
        ...formData,
        binaryCollections, // Adicionar binary collections ao formData
      },
      // Debug: adicionar binaryCollections também no nível raiz para facilitar debug
      _debug_binaryCollections: binaryCollections,
      // Adicionar dados dos protocolos separadamente para facilitar o carregamento no frontend
      sleepProtocols: {
        stopbang: questionnaire.stopbang_score || null,
        epworth: questionnaire.epworth_score || null,
        pdss2: questionnaire.pdss2_score || null,
        rbdsq: questionnaire.rbdsq_score || null,
      },
      fogq: questionnaire.fogq_score || null,
      pdfReports,
    };
  }

  async finalizeQuestionnaire(id: string) {
    const questionnaire = await this.questionnairesRepository.findOne({
      where: { id },
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${id} not found`);
    }

    // Se já está finalizado, retornar sem fazer nada (evita duplicação)
    if (questionnaire.status === 'completed') {
      return questionnaire;
    }

    questionnaire.status = 'completed';
    questionnaire.completed_at = new Date();
    questionnaire.last_step = 8; // Passo final

    return this.questionnairesRepository.save(questionnaire);
  }

  /**
   * Convert object to CSV row
   */
  private objectToCsvRow(obj: any): string {
    const values = Object.values(obj).map(val => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      // Escape quotes and wrap in quotes if contains comma, newline, or quote
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    return values.join(',');
  }

  /**
   * Generate CSV for Demographics, Anthropometric and Basic Clinical data
   */
  private generateDemographicAnthropometricClinicalCsv(data: any): string {
    const rows: string[] = [];
    
    // Header
    const headers = [
      'questionnaire_id',
      'patient_name',
      'cpf_hash',
      'data_coleta',
      'nome_avaliador',
      'birthday',
      'age',
      'gender',
      'etnia',
      'nationality',
      'education',
      'education_other',
      'marital_status',
      'occupation',
      'phone_number',
      'phone_number_contact',
      'email',
      'fuma_case',
      'fumou_antes',
      'smoking_duration',
      'stopped_smoking_duration',
      'renda_familiar',
      'deficiencia_visual',
      'rouquidao',
      'gagueja',
      'weight_kg',
      'height_cm',
      'imc',
      'waist_size',
      'hip_size',
      'abdominal',
      'diagnostic_description',
      'onset_age',
      'parkinson_onset',
      'initial_symptom',
      'parkinson_side',
      'family_case',
      'kinship_degree',
      'main_phenotype',
      'levodopa_on',
      'diskinesia_presence',
      'fog',
      'fog_classification',
      'wearing_off',
      'duration_wearing_off',
      'delay_on',
      'duration_l_dopa',
      'scale_hy',
      'scale_se',
      'comorbidities',
      'other_medications',
      'surgery',
      'surgery_year',
      'surgery_type',
      'surgery_target',
      'evolution',
      'symptom',
    ];
    rows.push(headers.join(','));

    // Data row
    const values = [
      data.id || '',
      data.data?.fullName || '',
      data.cpfHash || '', // Apenas hash do CPF
      data.data?.dataColeta || '',
      data.data?.nomeAvaliador || '',
      data.data?.birthday || '',
      data.data?.age || '',
      data.data?.gender || '',
      data.data?.etnia || '',
      data.data?.nationality || '',
      data.data?.education || '',
      data.data?.educationOther || '',
      data.data?.maritalStatus || '',
      data.data?.occupation || '',
      data.data?.phoneNumber || '',
      data.data?.phoneNumberContact || '',
      data.data?.email || '',
      data.data?.fumaCase || '',
      data.data?.fumouAntes || '',
      data.data?.smokingDuration || '',
      data.data?.stoppedSmokingDuration || '',
      data.data?.rendaFamiliar || '',
      data.data?.deficienciaVisual || '',
      data.data?.rouquidao || '',
      data.data?.gagueja || '',
      data.data?.weight || '',
      data.data?.height || '',
      data.data?.imc || '',
      data.data?.waistSize || '',
      data.data?.hipSize || '',
      data.data?.abdominal || '',
      data.data?.diagnosticDescription || '',
      data.data?.onsetAge || '',
      data.data?.parkinsonOnset || '',
      data.data?.initialSympton || '',
      data.data?.parkinsonSide || '',
      data.data?.familyCase || '',
      data.data?.kinshipDegree || '',
      data.data?.mainPhenotype || '',
      data.data?.levodopaOn ? 'Sim' : 'Não',
      data.data?.diskinectiaPresence ? 'Sim' : 'Não',
      data.data?.fog ? 'Sim' : 'Não',
      data.data?.fogClassifcation || '',
      data.data?.wearingOff ? 'Sim' : 'Não',
      data.data?.durationWearingOff || '',
      data.data?.DelayOn ? 'Sim' : 'Não',
      data.data?.durationLDopa || '',
      data.data?.scaleHY || '',
      data.data?.scaleSE || '',
      data.data?.comorbidities || '',
      data.data?.otherMedications || '',
      data.data?.surgery || '',
      data.data?.surgerrYear || '',
      data.data?.surgeryType || '',
      data.data?.surgeryTarget || '',
      data.data?.evolution || '',
      data.data?.symptom || '',
    ];
    rows.push(this.objectToCsvRow(values));

    return rows.join('\n');
  }

  /**
   * Generate CSV for Neurological Assessment (UPDRS3, MEEM, UDysRS)
   */
  private generateNeurologicalAssessmentCsv(data: any): string {
    const rows: string[] = [];
    
    // Header
    const headers = [
      'questionnaire_id',
      'patient_name',
      'cpf_hash',
      'updrs3_total_score',
      'updrs3_speech',
      'updrs3_facial_expression',
      'updrs3_rigidity_neck',
      'updrs3_rigidity_rue',
      'updrs3_rigidity_lue',
      'updrs3_rigidity_rle',
      'updrs3_rigidity_lle',
      'updrs3_finger_tapping_right',
      'updrs3_finger_tapping_left',
      'updrs3_hand_movements_right',
      'updrs3_hand_movements_left',
      'updrs3_pronation_supination_right',
      'updrs3_pronation_supination_left',
      'updrs3_toe_tapping_right',
      'updrs3_toe_tapping_left',
      'updrs3_leg_agility_right',
      'updrs3_leg_agility_left',
      'updrs3_rising_from_chair',
      'updrs3_gait',
      'updrs3_freezing_of_gait',
      'updrs3_postural_stability',
      'updrs3_posture',
      'updrs3_global_bradykinesia',
      'updrs3_postural_tremor_right',
      'updrs3_postural_tremor_left',
      'updrs3_kinetic_tremor_right',
      'updrs3_kinetic_tremor_left',
      'updrs3_rest_tremor_rue',
      'updrs3_rest_tremor_lue',
      'updrs3_rest_tremor_rle',
      'updrs3_rest_tremor_lle',
      'updrs3_rest_tremor_lip_jaw',
      'updrs3_postural_tremor_amplitude',
      'updrs3_dyskinesia_present',
      'updrs3_dyskinesia_interfered',
      'meem_total_score',
      'meem_orientation_day',
      'meem_orientation_date',
      'meem_orientation_month',
      'meem_orientation_year',
      'meem_orientation_time',
      'meem_orientation_location',
      'meem_orientation_institution',
      'meem_orientation_city',
      'meem_orientation_state',
      'meem_orientation_country',
      'meem_registration_word1',
      'meem_registration_word2',
      'meem_registration_word3',
      'meem_attention_calc1',
      'meem_attention_calc2',
      'meem_attention_calc3',
      'meem_attention_calc4',
      'meem_attention_calc5',
      'meem_attention_spell',
      'meem_recall_word1',
      'meem_recall_word2',
      'meem_recall_word3',
      'meem_language_naming',
      'meem_language_repetition',
      'meem_language_command1',
      'meem_language_command2',
      'meem_language_command3',
      'meem_language_reading',
      'meem_language_writing',
      'meem_language_copying',
      'udysrs_historical_subscore',
      'udysrs_objective_subscore',
      'udysrs_total_score',
      'udysrs_q1',
      'udysrs_q2',
      'udysrs_q3',
      'udysrs_q4',
      'udysrs_q5',
      'udysrs_q6',
      'udysrs_q7',
      'udysrs_q8',
      'udysrs_q9',
      'udysrs_q10',
      'udysrs_q11',
      'udysrs_q12',
      'udysrs_q13',
      'udysrs_q14',
      'udysrs_q15',
      'udysrs_q16',
      'udysrs_q17',
      'udysrs_q18',
      'udysrs_q19',
      'udysrs_q20',
      'udysrs_q21',
      'udysrs_q22',
      'udysrs_q23',
      'udysrs_q24',
      'udysrs_q25',
      'udysrs_q26',
      'udysrs_q27',
      'udysrs_q28',
    ];
    rows.push(headers.join(','));

    // Data row
    const updrs3 = data.data?.updrs3Scores || {};
    const meem = data.data?.meemScores || {};
    const udysrs = data.data?.udysrsScores || {};
    
    const values = [
      data.id || '',
      data.data?.fullName || '',
      data.cpfHash || '', // Apenas hash do CPF
      data.data?.scoreUPDRS3 || '',
      updrs3.speech || '',
      updrs3.facial_expression || '',
      updrs3.rigidity_neck || '',
      updrs3.rigidity_rue || '',
      updrs3.rigidity_lue || '',
      updrs3.rigidity_rle || '',
      updrs3.rigidity_lle || '',
      updrs3.finger_tapping_right || '',
      updrs3.finger_tapping_left || '',
      updrs3.hand_movements_right || '',
      updrs3.hand_movements_left || '',
      updrs3.pronation_supination_right || '',
      updrs3.pronation_supination_left || '',
      updrs3.toe_tapping_right || '',
      updrs3.toe_tapping_left || '',
      updrs3.leg_agility_right || '',
      updrs3.leg_agility_left || '',
      updrs3.rising_from_chair || '',
      updrs3.gait || '',
      updrs3.freezing_of_gait || '',
      updrs3.postural_stability || '',
      updrs3.posture || '',
      updrs3.global_bradykinesia || '',
      updrs3.postural_tremor_right || '',
      updrs3.postural_tremor_left || '',
      updrs3.kinetic_tremor_right || '',
      updrs3.kinetic_tremor_left || '',
      updrs3.rest_tremor_rue || '',
      updrs3.rest_tremor_lue || '',
      updrs3.rest_tremor_rle || '',
      updrs3.rest_tremor_lle || '',
      updrs3.rest_tremor_lip_jaw || '',
      updrs3.postural_tremor_amplitude || '',
      updrs3.dyskinesia_present || '',
      updrs3.dyskinesia_interfered || '',
      data.data?.scoreMEEN || '',
      meem.orientation_day || '',
      meem.orientation_date || '',
      meem.orientation_month || '',
      meem.orientation_year || '',
      meem.orientation_time || '',
      meem.orientation_location || '',
      meem.orientation_institution || '',
      meem.orientation_city || '',
      meem.orientation_state || '',
      meem.orientation_country || '',
      meem.registration_word1 || '',
      meem.registration_word2 || '',
      meem.registration_word3 || '',
      meem.attention_calc1 || '',
      meem.attention_calc2 || '',
      meem.attention_calc3 || '',
      meem.attention_calc4 || '',
      meem.attention_calc5 || '',
      meem.attention_spell || '',
      meem.recall_word1 || '',
      meem.recall_word2 || '',
      meem.recall_word3 || '',
      meem.language_naming || '',
      meem.language_repetition || '',
      meem.language_command1 || '',
      meem.language_command2 || '',
      meem.language_command3 || '',
      meem.language_reading || '',
      meem.language_writing || '',
      meem.language_copying || '',
      udysrs.historical_subscore || '',
      udysrs.objective_subscore || '',
      udysrs.total_score || '',
      udysrs.q1 || '',
      udysrs.q2 || '',
      udysrs.q3 || '',
      udysrs.q4 || '',
      udysrs.q5 || '',
      udysrs.q6 || '',
      udysrs.q7 || '',
      udysrs.q8 || '',
      udysrs.q9 || '',
      udysrs.q10 || '',
      udysrs.q11 || '',
      udysrs.q12 || '',
      udysrs.q13 || '',
      udysrs.q14 || '',
      udysrs.q15 || '',
      udysrs.q16 || '',
      udysrs.q17 || '',
      udysrs.q18 || '',
      udysrs.q19 || '',
      udysrs.q20 || '',
      udysrs.q21 || '',
      udysrs.q22 || '',
      udysrs.q23 || '',
      udysrs.q24 || '',
      udysrs.q25 || '',
      udysrs.q26 || '',
      udysrs.q27 || '',
      udysrs.q28 || '',
    ];
    rows.push(this.objectToCsvRow(values));

    return rows.join('\n');
  }

  /**
   * Generate CSV for Speech Therapy (NMF)
   */
  private generateSpeechTherapyCsv(data: any): string {
    const rows: string[] = [];
    
    // Header
    const headers = [
      'questionnaire_id',
      'patient_name',
      'cpf_hash',
      'nmf_total_score',
      'nmf_q1',
      'nmf_q2',
      'nmf_q3',
      'nmf_q4',
      'nmf_q5',
      'nmf_q6',
      'nmf_q7',
      'nmf_q8',
      'nmf_q9',
      'nmf_q10',
      'nmf_q11',
      'nmf_q12',
      'nmf_q13',
      'nmf_q14',
      'nmf_q15',
      'nmf_q16',
      'nmf_q17',
      'nmf_q18',
    ];
    rows.push(headers.join(','));

    // Data row - NMF data would need to be added to the questionnaire structure
    const nmf = data.data?.nmfScores || {};
    const values = [
      data.id || '',
      data.data?.fullName || '',
      data.cpfHash || '', // Apenas hash do CPF
      data.data?.scoreNMF || '',
      nmf.q1 || '',
      nmf.q2 || '',
      nmf.q3 || '',
      nmf.q4 || '',
      nmf.q5 || '',
      nmf.q6 || '',
      nmf.q7 || '',
      nmf.q8 || '',
      nmf.q9 || '',
      nmf.q10 || '',
      nmf.q11 || '',
      nmf.q12 || '',
      nmf.q13 || '',
      nmf.q14 || '',
      nmf.q15 || '',
      nmf.q16 || '',
      nmf.q17 || '',
      nmf.q18 || '',
    ];
    rows.push(this.objectToCsvRow(values));

    return rows.join('\n');
  }

  /**
   * Generate CSV for Sleep Assessment (STOP-Bang, Epworth, PDSS-2, RBDSQ)
   */
  private generateSleepAssessmentCsv(data: any): string {
    const rows: string[] = [];
    
    // Header
    const headers = [
      'questionnaire_id',
      'patient_name',
      'cpf_hash',
      'stopbang_total_score',
      'stopbang_snore',
      'stopbang_tired',
      'stopbang_observed',
      'stopbang_pressure',
      'stopbang_age',
      'stopbang_neck',
      'stopbang_gender',
      'epworth_total_score',
      'epworth_q1',
      'epworth_q2',
      'epworth_q3',
      'epworth_q4',
      'epworth_q5',
      'epworth_q6',
      'epworth_q7',
      'epworth_q8',
      'pdss2_total_score',
      'pdss2_q1',
      'pdss2_q2',
      'pdss2_q3',
      'pdss2_q4',
      'pdss2_q5',
      'pdss2_q6',
      'pdss2_q7',
      'pdss2_q8',
      'pdss2_q9',
      'pdss2_q10',
      'pdss2_q11',
      'pdss2_q12',
      'pdss2_q13',
      'pdss2_q14',
      'pdss2_q15',
      'rbdsq_total_score',
      'rbdsq_q1',
      'rbdsq_q2',
      'rbdsq_q3',
      'rbdsq_q4',
      'rbdsq_q5',
      'rbdsq_q6',
      'rbdsq_q7',
      'rbdsq_q8',
      'rbdsq_q9',
      'rbdsq_q10',
    ];
    rows.push(headers.join(','));

    // Data row
    const values = [
      data.id || '',
      data.data?.fullName || '',
      data.cpfHash || '', // Apenas hash do CPF
      data.data?.scoreStopBang || '',
      data.data?.stopbang_snore || '',
      data.data?.stopbang_tired || '',
      data.data?.stopbang_observed || '',
      data.data?.stopbang_pressure || '',
      data.data?.stopbang_age || '',
      data.data?.stopbang_neck || '',
      data.data?.stopbang_gender || '',
      data.data?.scoreEpworth || '',
      data.data?.epworth_q1 || '',
      data.data?.epworth_q2 || '',
      data.data?.epworth_q3 || '',
      data.data?.epworth_q4 || '',
      data.data?.epworth_q5 || '',
      data.data?.epworth_q6 || '',
      data.data?.epworth_q7 || '',
      data.data?.epworth_q8 || '',
      data.data?.scorePDSS2 || '',
      data.data?.pdss2_q1 || '',
      data.data?.pdss2_q2 || '',
      data.data?.pdss2_q3 || '',
      data.data?.pdss2_q4 || '',
      data.data?.pdss2_q5 || '',
      data.data?.pdss2_q6 || '',
      data.data?.pdss2_q7 || '',
      data.data?.pdss2_q8 || '',
      data.data?.pdss2_q9 || '',
      data.data?.pdss2_q10 || '',
      data.data?.pdss2_q11 || '',
      data.data?.pdss2_q12 || '',
      data.data?.pdss2_q13 || '',
      data.data?.pdss2_q14 || '',
      data.data?.pdss2_q15 || '',
      data.data?.scoreRBDSQ || '',
      data.data?.q1RBDSQ || '',
      data.data?.q2RBDSQ || '',
      data.data?.q3RBDSQ || '',
      data.data?.q4RBDSQ || '',
      data.data?.q5RBDSQ || '',
      data.data?.q6RBDSQ || '',
      data.data?.q7RBDSQ || '',
      data.data?.q8RBDSQ || '',
      data.data?.q9RBDSQ || '',
      data.data?.q10RBDSQ || '',
    ];
    rows.push(this.objectToCsvRow(values));

    return rows.join('\n');
  }

  /**
   * Generate CSV for Physiotherapy (FOGQ)
   */
  private generatePhysiotherapyCsv(data: any): string {
    const rows: string[] = [];
    
    // Header
    const headers = [
      'questionnaire_id',
      'patient_name',
      'cpf_hash',
      'fogq_total_score',
      'fogq_gait_worst_state',
      'fogq_impact_daily_activities',
      'fogq_feet_stuck',
      'fogq_longest_episode',
      'fogq_hesitation_turning',
    ];
    rows.push(headers.join(','));

    // Data row
    const fogq = data.fogq || {};
    const values = [
      data.id || '',
      data.data?.fullName || '',
      data.cpfHash || '', // Apenas hash do CPF
      data.data?.scoreFOGQ || '',
      fogq.gait_worst_state || '',
      fogq.impact_daily_activities || '',
      fogq.feet_stuck || '',
      fogq.longest_episode || '',
      fogq.hesitation_turning || '',
    ];
    rows.push(this.objectToCsvRow(values));

    return rows.join('\n');
  }

  /**
   * Export questionnaire data with all related data including binary collections
   */
  async exportQuestionnaireData(questionnaireId: string) {
    const questionnaire = await this.getQuestionnaireById(questionnaireId);
    
    // Generate CSV files
    const csvFiles = {
      demographicAnthropometricClinical: this.generateDemographicAnthropometricClinicalCsv(questionnaire),
      neurologicalAssessment: this.generateNeurologicalAssessmentCsv(questionnaire),
      speechTherapy: this.generateSpeechTherapyCsv(questionnaire),
      sleepAssessment: this.generateSleepAssessmentCsv(questionnaire),
      physiotherapy: this.generatePhysiotherapyCsv(questionnaire),
    };
    
    // Load PDF reports with binary data - optimized: single query with file_data
    const pdfReportsWithData = await this.pdfReportRepository
      .createQueryBuilder('report')
      .addSelect('report.file_data')
      .where('report.questionnaire_id = :questionnaireId', { questionnaireId })
      .getMany();

    const pdfReports = pdfReportsWithData.map((report) => ({
      id: report.id,
      report_type: report.report_type,
      file_name: report.file_name,
      file_size_bytes: report.file_size_bytes,
      mime_type: report.mime_type,
      uploaded_at: report.uploaded_at,
      notes: report.notes,
      file_data: report.file_data ? report.file_data.toString('base64') : null,
    }));
    
    // Get patient CPF hash to find ALL binary collections for this patient
    // Binary collections can be linked by questionnaire_id OR by patient_cpf_hash
    // This ensures we get all collections including repetitions
    const questionnaireEntity = await this.questionnairesRepository.findOne({
      where: { id: questionnaireId },
      relations: ['patient'],
    });
    
    const patientCpfHash = questionnaireEntity?.patient?.cpf_hash || null;

    // Load ALL binary collections for this patient (by questionnaire_id OR by patient_cpf_hash)
    // This ensures we get all collections including repetitions
    const binaryCollectionsQuery = this.binaryCollectionRepository
      .createQueryBuilder('bc')
      .leftJoinAndSelect('bc.active_task', 'active_task')
      .addSelect('bc.csv_data')
      .where('bc.questionnaire_id = :questionnaireId', { questionnaireId });
    
    if (patientCpfHash) {
      binaryCollectionsQuery.orWhere('bc.patient_cpf_hash = :patientCpfHash', { patientCpfHash });
    }
    
    const binaryCollections = await binaryCollectionsQuery
      .orderBy('bc.collected_at', 'ASC')
      .getMany();

    // Process binary collections - already have csv_data from query
    const binaryCollectionsWithData = binaryCollections.map((collection) => ({
      id: collection.id,
      patient_cpf_hash: collection.patient_cpf_hash,
      repetitions_count: collection.repetitions_count,
      task_id: collection.task_id,
      file_size_bytes: collection.file_size_bytes,
      file_checksum: collection.file_checksum,
      collection_type: collection.collection_type,
      device_type: collection.device_type,
      device_serial: collection.device_serial,
      sampling_rate_hz: collection.sampling_rate_hz,
      collected_at: collection.collected_at,
      uploaded_at: collection.uploaded_at,
      metadata: collection.metadata,
      processing_status: collection.processing_status,
      processing_error: collection.processing_error,
      active_task: collection.active_task,
      csv_data: collection.csv_data ? collection.csv_data.toString('utf-8') : null,
    }));

    return {
      questionnaire,
      csvFiles,
      pdfReports,
      binaryCollections: binaryCollectionsWithData,
    };
  }

  /**
   * Export all data for a patient (all questionnaires + binary collections)
   */
  async exportPatientData(patientId: string) {
    const questionnaires = await this.questionnairesRepository.find({
      where: { patient_id: patientId },
      order: { created_at: 'DESC' },
    });

    const exportData = await Promise.all(
      questionnaires.map(async (q) => {
        return await this.exportQuestionnaireData(q.id);
      })
    );

    return exportData;
  }

  /**
   * Export all questionnaires with all related data
   */
  async exportAllQuestionnairesData() {
    const questionnaires = await this.questionnairesRepository.find({
      order: { created_at: 'DESC' },
    });

    const exportData = await Promise.all(
      questionnaires.map(async (q) => {
        return await this.exportQuestionnaireData(q.id);
      })
    );

    return exportData;
  }

  /**
   * DEBUG: Get binary collections debug info for a questionnaire
   */
  async debugBinaryCollections(questionnaireId: string) {
    const questionnaire = await this.questionnairesRepository.findOne({
      where: { id: questionnaireId },
      relations: ['patient'],
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${questionnaireId} not found`);
    }

    const patient = questionnaire.patient;
    const patientCpfHash = patient?.cpf_hash;
    const patientCpf = patient?.cpf;

    // Buscar todas as binary collections possíveis
    const byCpfHash = patientCpfHash
      ? await this.binaryCollectionRepository.find({
          where: { patient_cpf_hash: patientCpfHash },
          relations: ['active_task'],
          order: { collected_at: 'DESC' },
        })
      : [];

    const byQuestionnaireId = await this.binaryCollectionRepository.find({
      where: { questionnaire_id: questionnaireId },
      relations: ['active_task'],
      order: { collected_at: 'DESC' },
    });

    // Buscar todas as binary collections (sem filtro) para comparação
    const allCollections = await this.binaryCollectionRepository
      .createQueryBuilder('bc')
      .leftJoinAndSelect('bc.active_task', 'active_task')
      .orderBy('bc.collected_at', 'DESC')
      .limit(100)
      .getMany();

    // Gerar hash alternativo se tiver CPF
    let alternativeHash = null;
    if (patientCpf) {
      try {
        alternativeHash = CryptoUtil.hashCpf(patientCpf);
      } catch (e) {
        // Ignorar erro
      }
    }

    return {
      questionnaire: {
        id: questionnaire.id,
        patient_id: questionnaire.patient_id,
      },
      patient: {
        id: patient?.id,
        cpf: patientCpf ? patientCpf.replace(/\d(?=\d{4})/g, '*') : null, // Mascarado
        cpf_hash: patientCpfHash ? patientCpfHash.substring(0, 16) + '...' : null,
        alternative_hash: alternativeHash ? alternativeHash.substring(0, 16) + '...' : null,
        hash_match: patientCpfHash === alternativeHash,
      },
      binaryCollections: {
        byCpfHash: {
          count: byCpfHash.length,
          hashes: Array.from(new Set(byCpfHash.map(bc => bc.patient_cpf_hash?.substring(0, 16) + '...'))),
          collections: byCpfHash.slice(0, 5).map(bc => ({
            id: bc.id,
            patient_cpf_hash: bc.patient_cpf_hash?.substring(0, 16) + '...',
            questionnaire_id: bc.questionnaire_id,
            task_id: bc.task_id,
            task_code: bc.active_task?.task_code,
            collected_at: bc.collected_at,
          })),
        },
        byQuestionnaireId: {
          count: byQuestionnaireId.length,
          collections: byQuestionnaireId.slice(0, 5).map(bc => ({
            id: bc.id,
            patient_cpf_hash: bc.patient_cpf_hash?.substring(0, 16) + '...',
            questionnaire_id: bc.questionnaire_id,
            task_id: bc.task_id,
            task_code: bc.active_task?.task_code,
            collected_at: bc.collected_at,
          })),
        },
        allInDatabase: {
          total: allCollections.length,
          uniqueHashes: Array.from(new Set(allCollections.map(bc => bc.patient_cpf_hash?.substring(0, 16) + '...'))).slice(0, 10),
        },
      },
      comparison: {
        patientHash: patientCpfHash ? patientCpfHash.substring(0, 16) + '...' : null,
        alternativeHash: alternativeHash ? alternativeHash.substring(0, 16) + '...' : null,
        foundByPatientHash: byCpfHash.length,
        foundByQuestionnaireId: byQuestionnaireId.length,
        foundByAlternativeHash: alternativeHash
          ? (await this.binaryCollectionRepository.count({
              where: { patient_cpf_hash: alternativeHash },
            }))
          : 0,
      },
    };
  }
}

