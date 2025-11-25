import { Questionnaire } from './questionnaire.entity';
export declare class PdfReport {
    id: string;
    questionnaire_id: string;
    report_type: string;
    file_path: string | null;
    file_data: Buffer | null;
    file_name: string;
    file_size_bytes: number | null;
    mime_type: string;
    uploaded_by: string | null;
    uploaded_at: Date;
    notes: string | null;
    questionnaire: Questionnaire;
}
