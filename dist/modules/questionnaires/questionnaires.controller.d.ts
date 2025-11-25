import { QuestionnairesService } from './questionnaires.service';
import { SaveStep1Dto } from './dto/save-step1.dto';
import { SaveStep2Dto } from './dto/save-step2.dto';
import { SaveStep3Dto } from './dto/save-step3.dto';
import { SaveUpdrs3Dto } from './dto/save-updrs3.dto';
import { SaveMeemDto } from './dto/save-meem.dto';
import { SaveUdysrsDto } from './dto/save-udysrs.dto';
import { SaveStopbangDto } from './dto/save-stopbang.dto';
import { SaveEpworthDto } from './dto/save-epworth.dto';
import { SavePdss2Dto } from './dto/save-pdss2.dto';
import { SaveRbdsqDto } from './dto/save-rbdsq.dto';
import { SaveFogqDto } from './dto/save-fogq.dto';
export declare class QuestionnairesController {
    private readonly questionnairesService;
    constructor(questionnairesService: QuestionnairesService);
    saveStep1(dto: SaveStep1Dto, user: {
        userId: string;
    }): Promise<{
        questionnaireId: string;
        patientId: string;
    }>;
    saveStep2(dto: SaveStep2Dto): Promise<import("../../entities/anthropometric-data.entity").AnthropometricData>;
    saveStep3(dto: SaveStep3Dto): Promise<import("../../entities/clinical-assessment.entity").ClinicalAssessment>;
    saveUpdrs3(dto: SaveUpdrs3Dto): Promise<{
        questionnaireId: string;
        totalScore: number;
    }>;
    saveMeem(dto: SaveMeemDto): Promise<{
        questionnaireId: string;
        totalScore: number;
    }>;
    saveUdysrs(dto: SaveUdysrsDto): Promise<{
        questionnaireId: string;
        historicalSubscore: number;
        objectiveSubscore: number;
        totalScore: number;
    }>;
    saveStopbang(dto: SaveStopbangDto): Promise<{
        questionnaireId: string;
        totalScore: number;
    }>;
    saveEpworth(dto: SaveEpworthDto): Promise<{
        questionnaireId: string;
        totalScore: number;
    }>;
    savePdss2(dto: SavePdss2Dto): Promise<{
        questionnaireId: string;
        totalScore: number;
    }>;
    saveRbdsq(dto: SaveRbdsqDto): Promise<{
        questionnaireId: string;
        totalScore: number;
    }>;
    saveFogq(dto: SaveFogqDto): Promise<{
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
        status: string;
        createdAt: string;
        updatedAt: string;
        completedAt: string;
        data: any;
        sleepProtocols: {
            stopbang: import("../../entities/stopbang-score.entity").StopbangScore;
            epworth: import("../../entities/epworth-score.entity").EpworthScore;
            pdss2: import("../../entities/pdss2-score.entity").Pdss2Score;
            rbdsq: import("../../entities/rbdsq-score.entity").RbdsqScore;
        };
        fogq: import("../../entities/fogq-score.entity").FogqScore;
        pdfReports: {
            id: string;
            reportType: string;
            fileName: string;
            fileSizeBytes: number;
            uploadedAt: Date;
            notes: string;
        }[];
    }>;
    finalizeQuestionnaire(id: string): Promise<import("../../entities/questionnaire.entity").Questionnaire>;
    exportQuestionnaireData(id: string): Promise<{
        questionnaire: {
            id: string;
            fullName: string;
            cpf: string;
            status: string;
            createdAt: string;
            updatedAt: string;
            completedAt: string;
            data: any;
            sleepProtocols: {
                stopbang: import("../../entities/stopbang-score.entity").StopbangScore;
                epworth: import("../../entities/epworth-score.entity").EpworthScore;
                pdss2: import("../../entities/pdss2-score.entity").Pdss2Score;
                rbdsq: import("../../entities/rbdsq-score.entity").RbdsqScore;
            };
            fogq: import("../../entities/fogq-score.entity").FogqScore;
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
            status: string;
            createdAt: string;
            updatedAt: string;
            completedAt: string;
            data: any;
            sleepProtocols: {
                stopbang: import("../../entities/stopbang-score.entity").StopbangScore;
                epworth: import("../../entities/epworth-score.entity").EpworthScore;
                pdss2: import("../../entities/pdss2-score.entity").Pdss2Score;
                rbdsq: import("../../entities/rbdsq-score.entity").RbdsqScore;
            };
            fogq: import("../../entities/fogq-score.entity").FogqScore;
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
            status: string;
            createdAt: string;
            updatedAt: string;
            completedAt: string;
            data: any;
            sleepProtocols: {
                stopbang: import("../../entities/stopbang-score.entity").StopbangScore;
                epworth: import("../../entities/epworth-score.entity").EpworthScore;
                pdss2: import("../../entities/pdss2-score.entity").Pdss2Score;
                rbdsq: import("../../entities/rbdsq-score.entity").RbdsqScore;
            };
            fogq: import("../../entities/fogq-score.entity").FogqScore;
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
