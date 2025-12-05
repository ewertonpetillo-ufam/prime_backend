import { Repository } from 'typeorm';
import { BinaryCollection } from '../../entities/binary-collection.entity';
import { Patient } from '../../entities/patient.entity';
import { ActiveTaskDefinition } from '../../entities/active-task-definition.entity';
import { Questionnaire } from '../../entities/questionnaire.entity';
export declare class BinaryCollectionsService {
    private binaryCollectionsRepository;
    private patientsRepository;
    private activeTaskRepository;
    private questionnairesRepository;
    constructor(binaryCollectionsRepository: Repository<BinaryCollection>, patientsRepository: Repository<Patient>, activeTaskRepository: Repository<ActiveTaskDefinition>, questionnairesRepository: Repository<Questionnaire>);
    uploadCsv(patient_cpf: string, task_code: string, file: Express.Multer.File): Promise<Omit<BinaryCollection, 'csv_data'>>;
    findAll(): Promise<BinaryCollection[]>;
    findOne(id: string): Promise<BinaryCollection>;
    findByCpf(patient_cpf: string): Promise<Omit<BinaryCollection, 'csv_data'>[]>;
    remove(id: string): Promise<void>;
    downloadCsv(id: string): Promise<{
        buffer: Buffer;
        filename: string;
    }>;
    countByQuestionnaireId(questionnaireId: string): Promise<number>;
}
