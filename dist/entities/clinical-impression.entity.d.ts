import { Questionnaire } from './questionnaire.entity';
export declare class ClinicalImpression {
    id: string;
    questionnaire_id: string;
    data: any;
    questionnaire: Questionnaire;
}
