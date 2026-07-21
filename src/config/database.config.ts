import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false, // IMPORTANT: false in production, database already has schema
    logging: configService.get<string>('NODE_ENV') === 'development',
    autoLoadEntities: true,
    extra: {
      // Connection pool settings
      max: 20,
      connectionTimeoutMillis: 30_000,
      idleTimeoutMillis: 30_000,
      // Safety net against runaway statements (e.g. accidental BYTEA materialization).
      // Per-statement limit; the sync job itself can run for hours across many queries.
      options: '-c statement_timeout=300000',
    },
  };
};
