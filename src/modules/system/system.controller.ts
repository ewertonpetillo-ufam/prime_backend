import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { SystemService } from './system.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('System')
@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Public()
  @Get('build')
  @ApiOperation({ summary: 'Get system build information' })
  @ApiResponse({
    status: 200,
    description: 'System build information',
    schema: {
      example: {
        version: '0.0.1',
        name: 'backend',
      },
    },
  })
  getBuildInfo() {
    return this.systemService.getBuildInfo();
  }
}

