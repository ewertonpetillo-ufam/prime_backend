import { Questionnaire } from './questionnaire.entity';
export declare class AnthropometricData {
    id: string;
    questionnaire_id: string;
    weight_kg: number;
    height_cm: number;
    bmi: number;
    waist_circumference_cm: number;
    hip_circumference_cm: number;
    waist_hip_ratio: number;
    abdominal_circumference_cm: number;
    created_at: Date;
    questionnaire: Questionnaire;
}
