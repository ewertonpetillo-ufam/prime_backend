export declare class CreatePatientDto {
    cpf: string;
    full_name: string;
    date_of_birth: string;
    gender_id?: number;
    ethnicity_id?: number;
    education_level_id?: number;
    marital_status_id?: number;
    income_range_id?: number;
    nationality?: string;
    phone_primary?: string;
    phone_secondary?: string;
    email?: string;
    occupation?: string;
    education_other?: string;
    is_current_smoker?: boolean;
    smoking_duration_years?: number;
    years_since_quit_smoking?: number;
    active?: boolean;
    deficiencia_visual?: boolean;
    hoarseness?: boolean;
    stuttering?: boolean;
}
