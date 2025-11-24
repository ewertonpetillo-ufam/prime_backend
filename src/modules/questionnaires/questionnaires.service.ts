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
        deficiencia_visual: dto.deficienciaVisual === 'Sim',
        hoarseness: dto.rouquidao === 'Sim',
        stuttering: dto.gagueja === 'Sim',
      });
    }

    // Find or create questionnaire for this patient and evaluator
    // Look for any non-completed questionnaire (draft or in_progress)
    let questionnaire = await this.questionnairesRepository.findOne({
      where: {
        patient_id: patient.id,
        evaluator_id: evaluatorId,
        status: In(['draft', 'in_progress']),
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
        abdominal_circumference_cm: dto.abdominal ? parseFloat(String(dto.abdominal)) : null,
      });
    } else {
      anthropometricData.weight_kg = dto.weight ? parseFloat(String(dto.weight)) : anthropometricData.weight_kg;
      anthropometricData.height_cm = dto.height ? parseFloat(String(dto.height)) : anthropometricData.height_cm;
      anthropometricData.waist_circumference_cm = dto.waistSize ? parseFloat(String(dto.waistSize)) : anthropometricData.waist_circumference_cm;
      anthropometricData.hip_circumference_cm = dto.hipSize ? parseFloat(String(dto.hipSize)) : anthropometricData.hip_circumference_cm;
      anthropometricData.abdominal_circumference_cm = dto.abdominal ? parseFloat(String(dto.abdominal)) : anthropometricData.abdominal_circumference_cm;
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

    return savedClinicalAssessment;
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
   * Search questionnaires by patient name or CPF
   */
  async searchQuestionnaires(term?: string) {
    const queryBuilder = this.questionnairesRepository
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.patient', 'patient')
      .leftJoinAndSelect('q.evaluator', 'evaluator')
      .leftJoinAndSelect('q.anthropometric_data', 'anthropometric')
      .leftJoinAndSelect('q.clinical_assessment', 'clinical')
      .leftJoinAndSelect('q.medications', 'medications')
      .orderBy('q.created_at', 'DESC');

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
    return Promise.all(questionnaires.map(q => this.formatQuestionnaireForFrontend(q)));
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
      .where('q.id = :id', { id })
      .getOne();

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${id} not found`);
    }

    // SEMPRE carregar medicamentos manualmente para garantir que estão disponíveis
    // O leftJoinAndSelect pode não estar funcionando corretamente para OneToMany
    try {
      // Usar createQueryBuilder para garantir que a query está correta
      const medications = await this.patientMedicationRepository
        .createQueryBuilder('pm')
        .where('pm.questionnaire_id = :questionnaireId', { questionnaireId: id })
        .getMany();
      
      questionnaire.medications = medications || [];
      
      console.log('✅ Medications loaded for questionnaire:', id, 'Count:', medications.length);
      if (medications.length > 0) {
        console.log('✅ All medications:', JSON.stringify(medications, null, 2));
        console.log('✅ Sample medication:', {
          id: medications[0].id,
          questionnaire_id: medications[0].questionnaire_id,
          medication_id: medications[0].medication_id,
          dose_mg: medications[0].dose_mg,
          doses_per_day: medications[0].doses_per_day,
          led_conversion_factor: medications[0].led_conversion_factor,
        });
      } else {
        console.log('⚠️ No medications found for questionnaire:', id);
        // Verificar se há medicamentos no banco com uma query direta
        const count = await this.patientMedicationRepository
          .createQueryBuilder('pm')
          .where('pm.questionnaire_id = :questionnaireId', { questionnaireId: id })
          .getCount();
        console.log('⚠️ Direct query count:', count);
      }
    } catch (error) {
      console.error('❌ Error loading medications:', error);
      questionnaire.medications = [];
    }

    return await this.formatQuestionnaireForFrontend(questionnaire);
  }

  /**
   * Format questionnaire data for frontend consumption
   */
  private async formatQuestionnaireForFrontend(questionnaire: Questionnaire) {
    // Ensure patient relations are loaded
    const patient = questionnaire.patient;
    if (!patient.gender && patient.gender_id) {
      patient.gender = await this.genderTypeRepository.findOne({ where: { id: patient.gender_id } });
    }
    if (!patient.ethnicity && patient.ethnicity_id) {
      patient.ethnicity = await this.ethnicityTypeRepository.findOne({ where: { id: patient.ethnicity_id } });
    }
    if (!patient.education_level && patient.education_level_id) {
      patient.education_level = await this.educationLevelRepository.findOne({ where: { id: patient.education_level_id } });
    }
    if (!patient.marital_status && patient.marital_status_id) {
      patient.marital_status = await this.maritalStatusTypeRepository.findOne({ where: { id: patient.marital_status_id } });
    }
    if (!patient.income_range && patient.income_range_id) {
      patient.income_range = await this.incomeRangeRepository.findOne({ where: { id: patient.income_range_id } });
    }
    
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
      fumouAntes: patient.years_since_quit_smoking !== null && patient.years_since_quit_smoking !== undefined
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

    return {
      id: questionnaire.id,
      fullName: patient.full_name,
      cpf: patient.cpf || '', // CPF armazenado em texto plano
      createdAt: questionnaire.created_at.toISOString().split('T')[0],
      updatedAt: questionnaire.updated_at.toISOString().split('T')[0],
      data: formData,
    };
  }
}

