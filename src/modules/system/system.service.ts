import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class SystemService {
  getBuildInfo() {
    try {
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      
      return {
        version: packageJson.version || '0.0.1',
        name: packageJson.name || 'backend',
      };
    } catch (error) {
      console.error('Erro ao buscar informações de build:', error);
      return {
        version: '0.0.1',
        name: 'backend',
      };
    }
  }
}

