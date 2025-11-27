import { Repository } from 'typeorm';
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
import { PatientsService } from '../patients/patients.service';
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
export declare class QuestionnairesService {
    private questionnairesRepository;
    private anthropometricDataRepository;
    private clinicalAssessmentRepository;
    private genderTypeRepository;
    private ethnicityTypeRepository;
    private educationLevelRepository;
    private maritalStatusTypeRepository;
    private incomeRangeRepository;
    private patientMedicationRepository;
    private medicationReferenceRepository;
    private parkinsonPhenotypeRepository;
    private dyskinesiaTypeRepository;
    private hoehnYahrScaleRepository;
    private surgeryTypeRepository;
    private updrs3Repository;
    private meemRepository;
    private udysrsRepository;
    private stopbangRepository;
    private epworthRepository;
    private pdss2Repository;
    private rbdsqRepository;
    private fogqRepository;
    private binaryCollectionRepository;
    private pdfReportRepository;
    private patientsService;
    constructor(questionnairesRepository: Repository<Questionnaire>, anthropometricDataRepository: Repository<AnthropometricData>, clinicalAssessmentRepository: Repository<ClinicalAssessment>, genderTypeRepository: Repository<GenderType>, ethnicityTypeRepository: Repository<EthnicityType>, educationLevelRepository: Repository<EducationLevel>, maritalStatusTypeRepository: Repository<MaritalStatusType>, incomeRangeRepository: Repository<IncomeRange>, patientMedicationRepository: Repository<PatientMedication>, medicationReferenceRepository: Repository<MedicationReference>, parkinsonPhenotypeRepository: Repository<ParkinsonPhenotype>, dyskinesiaTypeRepository: Repository<DyskinesiaType>, hoehnYahrScaleRepository: Repository<HoehnYahrScale>, surgeryTypeRepository: Repository<SurgeryType>, updrs3Repository: Repository<Updrs3Score>, meemRepository: Repository<MeemScore>, udysrsRepository: Repository<UdysrsScore>, stopbangRepository: Repository<StopbangScore>, epworthRepository: Repository<EpworthScore>, pdss2Repository: Repository<Pdss2Score>, rbdsqRepository: Repository<RbdsqScore>, fogqRepository: Repository<FogqScore>, binaryCollectionRepository: Repository<BinaryCollection>, pdfReportRepository: Repository<PdfReport>, patientsService: PatientsService);
    private assignScoreFields;
    private extractScoreData;
    private mapGenderToId;
    private mapEthnicityToId;
    private mapEducationToId;
    private mapMaritalStatusToId;
    private mapIncomeRangeToId;
    private parseSmokingDuration;
    private normalizeYesNoBoolean;
    private normalizeAffectedSide;
    private getOrCreateMedicationReference;
    saveStep1(dto: SaveStep1Dto, evaluatorId: string): Promise<{
        questionnaireId: string;
        patientId: string;
    }>;
    saveStep2(dto: SaveStep2Dto): Promise<AnthropometricData>;
    saveStep3(dto: SaveStep3Dto): Promise<ClinicalAssessment>;
    saveUpdrs3Scores(dto: SaveUpdrs3Dto): Promise<{
        questionnaireId: string;
        totalScore: number;
    }>;
    saveMeemScores(dto: SaveMeemDto): Promise<{
        questionnaireId: string;
        totalScore: number;
    }>;
    saveUdysrsScores(dto: SaveUdysrsDto): Promise<{
        questionnaireId: string;
        historicalSubscore: number;
        objectiveSubscore: number;
        totalScore: number;
    }>;
    saveStopbangScores(dto: SaveStopbangDto): Promise<{
        questionnaireId: string;
        totalScore: number;
    }>;
    saveEpworthScores(dto: SaveEpworthDto): Promise<{
        questionnaireId: string;
        totalScore: number;
    }>;
    savePdss2Scores(dto: SavePdss2Dto): Promise<{
        questionnaireId: string;
        totalScore: number;
    }>;
    saveRbdsqScores(dto: SaveRbdsqDto): Promise<{
        questionnaireId: string;
        totalScore: number;
    }>;
    saveFogqScores(dto: SaveFogqDto): Promise<{
        questionnaireId: string;
        totalScore: number;
    }>;
    getReferenceData(): Promise<{
        genders: {
            value: string;
            label: string;
            code: string;
            description: string;
        }[];
        ethnicities: {
            value: string;
            label: string;
        }[];
        educationLevels: {
            value: string;
            label: string;
        }[];
        maritalStatuses: {
            value: string;
            label: string;
        }[];
        incomeRanges: {
            value: string;
            label: string;
        }[];
        phenotypes: {
            value: string;
            label: string;
        }[];
        dyskinesiaTypes: {
            value: string;
            label: string;
        }[];
        affectedSides: {
            value: string;
            label: string;
        }[];
    }>;
    searchQuestionnaires(term?: string): Promise<{
        id: string;
        fullName: string;
        cpf: string;
        cpfHash: string;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date;
        status: string;
        data: any;
    }[]>;
    getQuestionnaireById(id: string): Promise<{
        id: string;
        fullName: string;
        cpf: string;
        cpfHash: string;
        status: string;
        lastStep: number;
        createdAt: string;
        updatedAt: string;
        completedAt: string;
        data: any;
        sleepProtocols: {
            stopbang: StopbangScore;
            epworth: EpworthScore;
            pdss2: Pdss2Score;
            rbdsq: RbdsqScore;
        };
        fogq: FogqScore;
        pdfReports: {
            id: string;
            reportType: string;
            fileName: string;
            fileSizeBytes: number;
            uploadedAt: Date;
            notes: string;
        }[];
    }>;
    private formatQuestionnaireForFrontend;
    finalizeQuestionnaire(id: string): Promise<Questionnaire>;
    private objectToCsvRow;
    private generateDemographicAnthropometricClinicalCsv;
    private generateNeurologicalAssessmentCsv;
    private generateSpeechTherapyCsv;
    private generateSleepAssessmentCsv;
    private generatePhysiotherapyCsv;
    exportQuestionnaireData(questionnaireId: string): Promise<{
        questionnaire: {
            id: string;
            fullName: string;
            cpf: string;
            cpfHash: string;
            status: string;
            lastStep: number;
            createdAt: string;
            updatedAt: string;
            completedAt: string;
            data: any;
            sleepProtocols: {
                stopbang: StopbangScore;
                epworth: EpworthScore;
                pdss2: Pdss2Score;
                rbdsq: RbdsqScore;
            };
            fogq: FogqScore;
            pdfReports: {
                id: string;
                reportType: string;
                fileName: string;
                fileSizeBytes: number;
                uploadedAt: Date;
                notes: string;
            }[];
        };
        csvFiles: {
            demographicAnthropometricClinical: string;
            neurologicalAssessment: string;
            speechTherapy: string;
            sleepAssessment: string;
            physiotherapy: string;
        };
        pdfReports: {
            id: string;
            report_type: string;
            file_name: string;
            file_size_bytes: number;
            mime_type: string;
            uploaded_at: Date;
            notes: string;
            file_data: string;
        }[];
        binaryCollections: {
            id: string;
            patient_cpf_hash: string;
            repetitions_count: number;
            task_id: number;
            file_size_bytes: number;
            file_checksum: string;
            collection_type: import("../../entities/binary-collection.entity").CollectionType;
            device_type: string;
            device_serial: string;
            sampling_rate_hz: number;
            collected_at: Date;
            uploaded_at: Date;
            metadata: any;
            processing_status: import("../../entities/binary-collection.entity").ProcessingStatus;
            processing_error: string;
            active_task: import("../../entities/active-task-definition.entity").ActiveTaskDefinition;
            csv_data: string;
        }[];
    }>;
    exportPatientData(patientId: string): Promise<{
        questionnaire: {
            id: string;
            fullName: string;
            cpf: string;
            cpfHash: string;
            status: string;
            lastStep: number;
            createdAt: string;
            updatedAt: string;
            completedAt: string;
            data: any;
            sleepProtocols: {
                stopbang: StopbangScore;
                epworth: EpworthScore;
                pdss2: Pdss2Score;
                rbdsq: RbdsqScore;
            };
            fogq: FogqScore;
            pdfReports: {
                id: string;
                reportType: string;
                fileName: string;
                fileSizeBytes: number;
                uploadedAt: Date;
                notes: string;
            }[];
        };
        csvFiles: {
            demographicAnthropometricClinical: string;
            neurologicalAssessment: string;
            speechTherapy: string;
            sleepAssessment: string;
            physiotherapy: string;
        };
        pdfReports: {
            id: string;
            report_type: string;
            file_name: string;
            file_size_bytes: number;
            mime_type: string;
            uploaded_at: Date;
            notes: string;
            file_data: string;
        }[];
        binaryCollections: {
            id: string;
            patient_cpf_hash: string;
            repetitions_count: number;
            task_id: number;
            file_size_bytes: number;
            file_checksum: string;
            collection_type: import("../../entities/binary-collection.entity").CollectionType;
            device_type: string;
            device_serial: string;
            sampling_rate_hz: number;
            collected_at: Date;
            uploaded_at: Date;
            metadata: any;
            processing_status: import("../../entities/binary-collection.entity").ProcessingStatus;
            processing_error: string;
            active_task: import("../../entities/active-task-definition.entity").ActiveTaskDefinition;
            csv_data: string;
        }[];
    }[]>;
    exportAllQuestionnairesData(): Promise<{
        questionnaire: {
            id: string;
            fullName: string;
            cpf: string;
            cpfHash: string;
            status: string;
            lastStep: number;
            createdAt: string;
            updatedAt: string;
            completedAt: string;
            data: any;
            sleepProtocols: {
                stopbang: StopbangScore;
                epworth: EpworthScore;
                pdss2: Pdss2Score;
                rbdsq: RbdsqScore;
            };
            fogq: FogqScore;
            pdfReports: {
                id: string;
                reportType: string;
                fileName: string;
                fileSizeBytes: number;
                uploadedAt: Date;
                notes: string;
            }[];
        };
        csvFiles: {
            demographicAnthropometricClinical: string;
            neurologicalAssessment: string;
            speechTherapy: string;
            sleepAssessment: string;
            physiotherapy: string;
        };
        pdfReports: {
            id: string;
            report_type: string;
            file_name: string;
            file_size_bytes: number;
            mime_type: string;
            uploaded_at: Date;
            notes: string;
            file_data: string;
        }[];
        binaryCollections: {
            id: string;
            patient_cpf_hash: string;
            repetitions_count: number;
            task_id: number;
            file_size_bytes: number;
            file_checksum: string;
            collection_type: import("../../entities/binary-collection.entity").CollectionType;
            device_type: string;
            device_serial: string;
            sampling_rate_hz: number;
            collected_at: Date;
            uploaded_at: Date;
            metadata: any;
            processing_status: import("../../entities/binary-collection.entity").ProcessingStatus;
            processing_error: string;
            active_task: import("../../entities/active-task-definition.entity").ActiveTaskDefinition;
            csv_data: string;
        }[];
    }[]>;
}
