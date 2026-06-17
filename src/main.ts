import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { CryptoUtil } from './utils/crypto.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get ConfigService instance
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  const isProduction = nodeEnv === 'production';

  // Security headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: isProduction,
    crossOriginEmbedderPolicy: isProduction,
  }));

  // Initialize CryptoUtil with ConfigService
  CryptoUtil.setConfigService(configService);

  // Global API prefix
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // CORS configuration - Restritivo em produção, permissivo em desenvolvimento
  const corsOriginEnv = configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000';
  const allowedOrigins = corsOriginEnv.split(',').map(origin => origin.trim()).filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Requisições sem Origin (same-origin requests ou requisições diretas)
      // Em produção: permitir apenas para requisições same-origin (mais seguro)
      // Isso permite acesso direto ao Swagger e outros recursos da própria API
      if (!origin) {
        if (isProduction) {
          // Em produção, permitir requisições sem Origin (same-origin)
          // Isso é seguro pois são requisições do mesmo domínio
          return callback(null, true);
        }
        // Em desenvolvimento, permitir para facilitar testes
        if (nodeEnv === 'development') {
          console.log('✅ Requisição sem Origin (app nativo/tool) - PERMITIDO [DEV ONLY]');
        }
        return callback(null, true);
      }

      // Verificar se Origin está na lista permitida
      if (allowedOrigins.includes(origin)) {
        if (nodeEnv === 'development') {
          console.log(`✅ Origin permitido: ${origin}`);
        }
        return callback(null, true);
      }

      // Em desenvolvimento: permitir qualquer localhost (para facilitar testes)
      if (!isProduction && origin && origin.startsWith('http://localhost:')) {
        if (nodeEnv === 'development') {
          console.log(`✅ Origin localhost permitido em dev: ${origin}`);
        }
        return callback(null, true);
      }

      // Origin não autorizado - sempre logar
      if (isProduction) {
        console.warn(`⚠️  CORS bloqueado em produção: ${origin}`);
      } else {
        console.log(`❌ Origin bloqueado: ${origin}`);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-ID'],
    maxAge: isProduction ? 86400 : 0, // Cache preflight por 24h em produção
  });

  // Log quando conexão de upload abre (antes do Multer receber o body completo)
  app.use((req, res, next) => {
    if (req.method !== 'POST') {
      return next();
    }
    const path = req.path || req.url || '';
    if (!path.includes('pdf-reports/upload') && !path.includes('binary-collections/upload')) {
      return next();
    }

    const contentLength = req.headers['content-length'];
    const startedAt = Date.now();
    console.log('[upload] connection_opened', {
      path,
      contentLengthBytes: contentLength ?? 'unknown',
      contentType: req.headers['content-type'],
    });

    req.on('aborted', () => {
      console.error('[upload] connection_aborted', {
        path,
        contentLengthBytes: contentLength ?? 'unknown',
        elapsedMs: Date.now() - startedAt,
      });
    });

    req.on('end', () => {
      console.log('[upload] request_body_fully_received', {
        path,
        contentLengthBytes: contentLength ?? 'unknown',
        elapsedMs: Date.now() - startedAt,
      });
    });

    return next();
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
    .addTag('Users', 'User management endpoints')
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

  // Swagger configuration - Desabilitado em produção por padrão (segurança)
  const enableSwagger = configService.get<string>('ENABLE_SWAGGER') === 'true' || !isProduction;
  const swaggerUsername = configService.get<string>('SWAGGER_USERNAME');
  const swaggerPassword = configService.get<string>('SWAGGER_PASSWORD');

  if (enableSwagger) {
    // Em produção, Swagger DEVE estar protegido com autenticação
    if (isProduction && (!swaggerUsername || !swaggerPassword)) {
      console.warn('⚠️  ATENÇÃO: Swagger habilitado em produção sem autenticação! Configure SWAGGER_USERNAME e SWAGGER_PASSWORD.');
    }

    // Protect Swagger with HTTP Basic Auth (obrigatório em produção)
    if (swaggerUsername && swaggerPassword) {
      app.use((req, res, next) => {
        // Check if the request is for Swagger documentation
        if (req.path.startsWith('/api/docs')) {
          const authHeader = req.headers.authorization;

          if (!authHeader || !authHeader.startsWith('Basic ')) {
            res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
            return res.status(401).json({
              statusCode: 401,
              message: 'Authentication required',
              error: 'Unauthorized',
            });
          }

          // Decode Basic Auth credentials
          const base64Credentials = authHeader.split(' ')[1];
          const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
          const [username, password] = credentials.split(':');

          // Validate credentials
          if (username === swaggerUsername && password === swaggerPassword) {
            return next();
          }

          // Invalid credentials
          res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
          return res.status(401).json({
            statusCode: 401,
            message: 'Invalid credentials',
            error: 'Unauthorized',
          });
        }
        // If not a Swagger request, continue normally
        return next();
      });
    }

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  } else if (isProduction) {
    console.log('🔒 Swagger desabilitado em produção (configure ENABLE_SWAGGER=true para habilitar)');
  }

  // Start server
  const port = configService.get<number>('PORT') || 4000;
  await app.listen(port);

  // Logs de inicialização
  console.log(`🚀 PRIME API is running on: http://0.0.0.0:${port}/${apiPrefix}`);
  console.log(`🌍 Ambiente: ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
  
  if (enableSwagger) {
    if (swaggerUsername && swaggerPassword) {
      console.log(`📚 Swagger docs: http://0.0.0.0:${port}/api/docs (protegido com Basic Auth)`);
    } else {
      console.log(`⚠️  Swagger docs: http://0.0.0.0:${port}/api/docs (SEM AUTENTICAÇÃO - configure SWAGGER_USERNAME e SWAGGER_PASSWORD)`);
    }
  }
  
  if (isProduction) {
    console.log(`🔒 CORS configurado para: ${allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'NENHUMA ORIGEM (BLOQUEADO)'}`);
    console.log(`🛡️  Requisições sem Origin: PERMITIDAS (same-origin requests)`);
  } else {
    console.log(`🔒 CORS configurado para: ${allowedOrigins.join(', ') || 'nenhuma origem específica'}`);
    console.log(`📱 Apps nativos: permitidos (sem Origin) [DEV ONLY]`);
  }
}

bootstrap();
