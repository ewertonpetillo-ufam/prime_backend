import { Questionnaire } from './questionnaire.entity';
export declare class EpworthScore {
    id: string;
    questionnaire_id: string;
    sitting_reading: number | null;
    watching_tv: number | null;
    sitting_inactive_public: number | null;
    passenger_car: number | null;
    lying_down_afternoon: number | null;
    sitting_talking: number | null;
    sitting_after_lunch: number | null;
    car_stopped_traffic: number | null;
    total_score: number | null;
    questionnaire: Questionnaire;
}
