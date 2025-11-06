import { Questionnaire } from './questionnaire.entity';
export declare class PatientMedication {
    id: string;
    questionnaire_id: string;
    medication_reference_id: number;
    daily_dose_mg: number;
    frequency_per_day: number;
    questionnaire: Questionnaire;
}
