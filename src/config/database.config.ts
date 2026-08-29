import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { isTransientPgError } from '../common/database/pg-transient';

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
    retryAttempts: 10,
    retryDelay: 3_000,
    toRetry: (error) => isTransientPgError(error),
    extra: {
      // Connection pool settings
      max: 20,
      connectionTimeoutMillis: 30_000,
      idleTimeoutMillis: 30_000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10_000,
      // Sem statement_timeout global: confirmRunDelivery e syncs longos
      // legítimos excedem limites curtos e marcariam FAILED após o ZIP já no BART.
    },
  };
};
