import { Questionnaire } from './questionnaire.entity';
export declare class FogqScore {
    id: string;
    questionnaire_id: string;
    gait_worst_state: number | null;
    impact_daily_activities: number | null;
    feet_stuck: number | null;
    longest_episode: number | null;
    hesitation_initiation: number | null;
    hesitation_turning: number | null;
    total_score: number | null;
    questionnaire: Questionnaire;
}
