import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { EvaluatorsModule } from './modules/evaluators/evaluators.module';
import { PatientsModule } from './modules/patients/patients.module';
import { BinaryCollectionsModule } from './modules/binary-collections/binary-collections.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { UsersModule } from './modules/users/users.module';
import { SystemModule } from './modules/system/system.module';
import { QuestionnairesModule } from './modules/questionnaires/questionnaires.module';
import { PdfReportsModule } from './modules/pdf-reports/pdf-reports.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    // Configuration module - loads .env file
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // TypeORM module - connects to PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    // Authentication module
    AuthModule,
    // Feature modules
    EvaluatorsModule,
    PatientsModule,
    BinaryCollectionsModule,
    TasksModule,
    UsersModule,
    SystemModule,
    QuestionnairesModule,
    PdfReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply JWT guard globally to all routes
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Apply exception filter globally
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
