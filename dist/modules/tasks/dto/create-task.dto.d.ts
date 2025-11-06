import { TaskCategory } from '../../../entities/active-task-definition.entity';
export declare class CreateTaskDto {
    task_code: string;
    task_name: string;
    task_category?: TaskCategory;
    collection_form_type_id?: number;
    stage?: number;
    description?: string;
    instructions?: string;
    active?: boolean;
}
