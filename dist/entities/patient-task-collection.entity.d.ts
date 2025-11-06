import { Questionnaire } from './questionnaire.entity';
import { ActiveTaskDefinition } from './active-task-definition.entity';
export declare class PatientTaskCollection {
    id: string;
    questionnaire_id: string;
    active_task_id: number;
    completed_at: Date;
    progress_percent: number;
    questionnaire: Questionnaire;
    active_task: ActiveTaskDefinition;
}
