import { Questionnaire } from './questionnaire.entity';
export declare class PatientMedication {
    id: string;
    questionnaire_id: string;
    medication_id: number;
    dose_mg: number;
    doses_per_day: number;
    led_conversion_factor: number;
    created_at: Date;
    questionnaire: Questionnaire;
}
