import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class UploadBinaryDto {
  @ApiProperty({
    description: 'CPF of the patient (11 digits, will be hashed)',
    example: '12345678900',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11}$/, { message: 'CPF must contain exactly 11 digits' })
  patient_cpf: string;

  @ApiProperty({
    description: 'Task code (e.g., TA1, TA2, TA3)',
    example: 'TA1',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  task_code: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'CSV file containing sensor data',
  })
  file: any; // Will be handled by Multer
}
