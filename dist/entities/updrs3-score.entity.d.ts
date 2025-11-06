import { Questionnaire } from './questionnaire.entity';
export declare class Updrs3Score {
    id: string;
    questionnaire_id: string;
    scores: any;
    total_score: number;
    questionnaire: Questionnaire;
}
