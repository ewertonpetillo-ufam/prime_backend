import { Questionnaire } from './questionnaire.entity';
export declare class StopbangScore {
    id: string;
    questionnaire_id: string;
    snoring: boolean;
    tired: boolean;
    observed_apnea: boolean;
    blood_pressure: boolean;
    bmi_over_35: boolean;
    age_over_50: boolean;
    neck_circumference_large: boolean;
    gender_male: boolean;
    total_score: number | null;
    questionnaire: Questionnaire;
}
