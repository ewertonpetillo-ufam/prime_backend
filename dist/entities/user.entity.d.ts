import { Questionnaire } from './questionnaire.entity';
export declare enum UserRole {
    ADMIN = "admin",
    EVALUATOR = "evaluator",
    RESEARCHER = "researcher"
}
export declare class User {
    id: string;
    full_name: string;
    email: string;
    password_hash: string;
    role: UserRole;
    registration_number: string;
    specialty: string;
    phone: string;
    active: boolean;
    first_login: boolean;
    created_at: Date;
    updated_at: Date;
    questionnaires: Questionnaire[];
}
