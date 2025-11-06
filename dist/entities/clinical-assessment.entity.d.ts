import { Questionnaire } from './questionnaire.entity';
export declare class ClinicalAssessment {
    id: string;
    questionnaire_id: string;
    diagnosis_year: number;
    phenotype_id: number;
    hoehn_yahr_stage_id: number;
    motor_fluctuations: boolean;
    wearing_off: boolean;
    dyskinesia: boolean;
    dyskinesia_type_id: number;
    previous_surgery: boolean;
    surgery_type_id: number;
    surgery_year: number;
    comorbidities: string;
    notes: string;
    created_at: Date;
    updated_at: Date;
    questionnaire: Questionnaire;
}
