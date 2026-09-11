import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class PatchFreeLivingTestRecommendedDto {
  @ApiProperty({
    description: 'Indica se o paciente foi recomendado para o teste de Free Living',
    example: true,
  })
  @IsBoolean()
  freeLivingTestRecommended: boolean;
}
