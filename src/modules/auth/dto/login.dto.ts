import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Client ID (collection_app or web_frontend)',
    example: 'web_frontend',
    enum: ['collection_app', 'web_frontend'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['collection_app', 'web_frontend'])
  client_id: string;

  @ApiProperty({
    description: 'Client secret',
    example: 'web_frontend_secret_dev_2024',
  })
  @IsString()
  @IsNotEmpty()
  client_secret: string;
}
