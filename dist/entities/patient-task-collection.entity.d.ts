import { Questionnaire } from './questionnaire.entity';
import { ActiveTaskDefinition } from './active-task-definition.entity';
export declare class PatientTaskCollection {
    id: string;
    questionnaire_id: string;
    task_id: number;
    completion_percentage: number;
    completed_items: number[];
    collected_at: Date;
    collector_notes: string;
    created_at: Date;
    questionnaire: Questionnaire;
    active_task: ActiveTaskDefinition;
}
