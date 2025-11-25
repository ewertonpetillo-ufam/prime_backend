import { ActiveTaskDefinition } from './active-task-definition.entity';
export declare class TaskChecklistItem {
    id: number;
    task_id: number;
    item_order: number;
    item_description: string;
    task: ActiveTaskDefinition;
}
