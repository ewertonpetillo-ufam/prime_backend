import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto';

// Omit CPF from update DTO - CPF cannot be changed after creation
export class UpdatePatientDto extends PartialType(
  OmitType(CreatePatientDto, ['cpf'] as const),
) {}
