import { Questionnaire } from './questionnaire.entity';
export declare class Evaluator {
    id: string;
    full_name: string;
    registration_number: string;
    specialty: string;
    email: string;
    phone: string;
    created_at: Date;
    updated_at: Date;
    questionnaires: Questionnaire[];
}
