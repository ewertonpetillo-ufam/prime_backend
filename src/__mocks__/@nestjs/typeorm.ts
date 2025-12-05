// Mock for @nestjs/typeorm to avoid crypto conflicts in tests
// This mock allows tests to use @InjectRepository without the crypto conflict

import 'reflect-metadata';
import { Inject } from '@nestjs/common';
import { DataSourceOptions } from 'typeorm';

function getRepositoryToken(entity: Function | string): string {
  if (typeof entity === 'string') {
    return entity;
  }
  return `${entity.name}Repository`;
}

// InjectRepository decorator - uses NestJS Inject internally
// The real implementation: InjectRepository(entity) = Inject(getRepositoryToken(entity))
export function InjectRepository(entity: Function) {
  const token = getRepositoryToken(entity);
  return Inject(token);
}

export const TypeOrmModule = {
  forRoot: jest.fn(),
  forRootAsync: jest.fn(),
  forFeature: jest.fn(),
};

// TypeOrmModuleOptions type - re-export from typeorm DataSourceOptions
export type TypeOrmModuleOptions = DataSourceOptions & {
  retryAttempts?: number;
  retryDelay?: number;
  toRetry?: (err: any) => boolean;
  keepConnectionAlive?: boolean;
  verboseRetryLog?: boolean;
  autoLoadEntities?: boolean;
};

export { getRepositoryToken };

