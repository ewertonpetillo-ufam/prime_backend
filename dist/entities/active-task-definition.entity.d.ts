import { PatientTaskCollection } from './patient-task-collection.entity';
export declare enum TaskCategory {
    MOTOR = "MOTOR",
    SPEECH = "SPEECH",
    GAIT = "GAIT",
    OTHER = "OTHER"
}
export declare class ActiveTaskDefinition {
    id: number;
    task_code: string;
    task_name: string;
    task_category: TaskCategory;
    collection_form_type_id: number;
    stage: number;
    description: string;
    instructions: string;
    active: boolean;
    patient_tasks: PatientTaskCollection[];
}
