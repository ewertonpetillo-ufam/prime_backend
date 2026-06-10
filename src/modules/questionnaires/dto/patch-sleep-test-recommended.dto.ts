import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class PatchSleepTestRecommendedDto {
  @ApiProperty({
    description: 'Indica se o paciente foi recomendado para o teste de sono',
    example: true,
  })
  @IsBoolean()
  sleepTestRecommended: boolean;
}
