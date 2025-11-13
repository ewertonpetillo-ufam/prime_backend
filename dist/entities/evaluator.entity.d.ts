import { Questionnaire } from './questionnaire.entity';
export declare class Evaluator {
    id: string;
    full_name: string;
    email: string;
    password_hash: string;
    role: string;
    registration_number: string;
    specialty: string;
    phone: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
    questionnaires: Questionnaire[];
}
