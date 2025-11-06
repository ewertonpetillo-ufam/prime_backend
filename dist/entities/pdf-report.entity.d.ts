import { Questionnaire } from './questionnaire.entity';
export declare class PdfReport {
    id: string;
    questionnaire_id: string;
    data: any;
    questionnaire: Questionnaire;
}
