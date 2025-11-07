import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CryptoUtil } from './utils/crypto.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get ConfigService instance
  const configService = app.get(ConfigService);

  // Initialize CryptoUtil with ConfigService
  CryptoUtil.setConfigService(configService);

  // Global API prefix
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // CORS configuration - Aceita apps nativos (sem Origin) e múltiplas origens
  const corsOriginEnv = configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000';
  const allowedOrigins = corsOriginEnv.split(',').map(origin => origin.trim()).filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Caso 1: Requisição sem Origin (apps nativos, Postman, cURL, ferramentas)
      if (!origin) {
        // Log apenas em desenvolvimento para reduzir ruído
        if (configService.get<string>('NODE_ENV') === 'development') {
          console.log('✅ Requisição sem Origin (app nativo/tool) - PERMITIDO');
        }
        return callback(null, true);
      }

      // Caso 2: Origin está na lista permitida
      if (allowedOrigins.includes(origin)) {
        // Log apenas em desenvolvimento
        if (configService.get<string>('NODE_ENV') === 'development') {
          console.log(`✅ Origin permitido: ${origin}`);
        }
        return callback(null, true);
      }

      // Caso 3: Origin não autorizado - sempre logar para segurança
      console.log(`❌ Origin bloqueado: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-ID'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Allow implicit type conversion
      },
    }),
  );

  // Swagger documentation setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('PRIME API')
    .setDescription(
      'API Backend for PRIME - Parkinson\'s Disease Clinical Assessment System',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addBasicAuth(
      {
        type: 'http',
        scheme: 'basic',
        description: 'Enter username and password',
      },
      'Basic-auth',
    )
    .addTag('Authentication', 'JWT authentication endpoints')
    .addTag('Evaluators', 'Healthcare professionals management')
    .addTag('Patients', 'Patient management with CPF anonymization')
    .addTag('Questionnaires', 'Clinical assessment sessions')
    .addTag('Clinical Data', 'Anthropometric and clinical assessment data')
    .addTag('Neurological Scales', 'Neurological assessment scales')
    .addTag('Active Tasks', 'Active task definitions management')
    .addTag('Binary Collections', 'Sensor data and CSV uploads')
    .addTag('Reports', 'PDF reports and clinical impressions')
    .addTag('Reference Data', 'Reference tables and lookup data')
    .addTag('Search', 'Search and summary endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Start server
  const port = configService.get<number>('PORT') || 4000;
  await app.listen(port);

  console.log(`🚀 PRIME API is running on: http://0.0.0.0:${port}/${apiPrefix}`);
  console.log(`📚 Swagger docs available at: http://0.0.0.0:${port}/api/docs`);
  console.log(`🔒 CORS configurado para: ${allowedOrigins.join(', ') || 'nenhuma origem específica'}`);
  console.log(`📱 Apps nativos: permitidos (sem Origin)`);
}

bootstrap();
