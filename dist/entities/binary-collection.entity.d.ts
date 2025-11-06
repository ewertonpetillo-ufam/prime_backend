import { Questionnaire } from './questionnaire.entity';
import { ActiveTaskDefinition } from './active-task-definition.entity';
export declare enum CollectionType {
    MOTOR = "MOTOR",
    GAIT = "GAIT",
    TREMOR = "TREMOR",
    SPEECH = "SPEECH",
    OTHER = "OTHER"
}
export declare enum ProcessingStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    ERROR = "error"
}
export declare class BinaryCollection {
    id: string;
    patient_cpf_hash: string;
    repetitions_count: number;
    task_id: number;
    questionnaire_id: string;
    csv_data: Buffer;
    file_size_bytes: number;
    file_checksum: string;
    collection_type: CollectionType;
    device_type: string;
    device_serial: string;
    sampling_rate_hz: number;
    collected_at: Date;
    uploaded_at: Date;
    metadata: any;
    processing_status: ProcessingStatus;
    processing_error: string;
    questionnaire: Questionnaire;
    active_task: ActiveTaskDefinition;
}
