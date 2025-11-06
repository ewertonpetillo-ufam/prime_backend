import { Patient } from './patient.entity';
import { Evaluator } from './evaluator.entity';
import { AnthropometricData } from './anthropometric-data.entity';
import { ClinicalAssessment } from './clinical-assessment.entity';
import { PatientMedication } from './patient-medication.entity';
import { Updrs3Score } from './updrs3-score.entity';
import { MeemScore } from './meem-score.entity';
import { UdysrsScore } from './udysrs-score.entity';
import { NmsScore } from './nms-score.entity';
import { NmfScore } from './nmf-score.entity';
import { FogqScore } from './fogq-score.entity';
import { StopbangScore } from './stopbang-score.entity';
import { EpworthScore } from './epworth-score.entity';
import { Pdss1Score } from './pdss1-score.entity';
import { RbdsqScore } from './rbdsq-score.entity';
import { PatientTaskCollection } from './patient-task-collection.entity';
import { PdfReport } from './pdf-report.entity';
import { ClinicalImpression } from './clinical-impression.entity';
import { BinaryCollection } from './binary-collection.entity';
export declare enum QuestionnaireStatus {
    DRAFT = "DRAFT",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    ARCHIVED = "ARCHIVED"
}
export declare class Questionnaire {
    id: string;
    patient_id: string;
    evaluator_id: string;
    collection_date: Date;
    status: QuestionnaireStatus;
    notes: string;
    created_at: Date;
    updated_at: Date;
    patient: Patient;
    evaluator: Evaluator;
    anthropometric_data: AnthropometricData;
    clinical_assessment: ClinicalAssessment;
    medications: PatientMedication[];
    updrs3_score: Updrs3Score;
    meem_score: MeemScore;
    udysrs_score: UdysrsScore;
    nms_score: NmsScore;
    nmf_score: NmfScore;
    fogq_score: FogqScore;
    stopbang_score: StopbangScore;
    epworth_score: EpworthScore;
    pdss1_score: Pdss1Score;
    rbdsq_score: RbdsqScore;
    task_collections: PatientTaskCollection[];
    pdf_reports: PdfReport[];
    clinical_impression: ClinicalImpression;
    binary_collections: BinaryCollection[];
}
