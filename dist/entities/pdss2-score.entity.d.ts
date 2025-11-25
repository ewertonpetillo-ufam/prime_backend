import { Questionnaire } from './questionnaire.entity';
export declare class Pdss2Score {
    id: string;
    questionnaire_id: string;
    q1: number | null;
    q2: number | null;
    q3: number | null;
    q4: number | null;
    q5: number | null;
    q6: number | null;
    q7: number | null;
    q8: number | null;
    q9: number | null;
    q10: number | null;
    q11: number | null;
    q12: number | null;
    q13: number | null;
    q14: number | null;
    q15: number | null;
    total_score: number | null;
    questionnaire: Questionnaire;
}
