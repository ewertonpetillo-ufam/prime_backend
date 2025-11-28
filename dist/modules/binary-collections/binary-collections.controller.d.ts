import { StreamableFile } from '@nestjs/common';
import { BinaryCollectionsService } from './binary-collections.service';
export declare class BinaryCollectionsController {
    private readonly binaryCollectionsService;
    constructor(binaryCollectionsService: BinaryCollectionsService);
    uploadCsv(file: Express.Multer.File, patient_cpf: string, task_code: string): Promise<Omit<import("../../entities/binary-collection.entity").BinaryCollection, "csv_data">>;
    findAll(): Promise<import("../../entities/binary-collection.entity").BinaryCollection[]>;
    findByCpf(cpf: string): Promise<Omit<import("../../entities/binary-collection.entity").BinaryCollection, "csv_data">[]>;
    downloadCsv(id: string): Promise<StreamableFile>;
    findOne(id: string): Promise<import("../../entities/binary-collection.entity").BinaryCollection>;
    remove(id: string): Promise<void>;
    countByQuestionnaireId(questionnaireId: string): Promise<{
        count: number;
    }>;
}
