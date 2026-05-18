import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const EXPORT_ZIP_QUEUE = 'export-zip';
export const EXPORT_PRIME_QUEUE = 'export-prime';
export const BART_SYNC_QUEUE = 'bart-sync';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const password = config.get<string>('REDIS_PASSWORD');
        return {
          connection: {
            host: config.get<string>('REDIS_HOST', 'localhost'),
            port: config.get<number>('REDIS_PORT', 6379),
            ...(password ? { password } : {}),
            db: config.get<number>('REDIS_DB', 0),
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: EXPORT_ZIP_QUEUE }),
    BullModule.registerQueue({ name: EXPORT_PRIME_QUEUE }),
    BullModule.registerQueue({ name: BART_SYNC_QUEUE }),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
