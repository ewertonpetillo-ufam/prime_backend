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
      connectionTimeoutMillis: 5000,
    },
  };
};
