"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
const crypto_util_1 = require("./utils/crypto.util");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const nodeEnv = configService.get('NODE_ENV') || 'development';
    const isProduction = nodeEnv === 'production';
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: isProduction,
        crossOriginEmbedderPolicy: isProduction,
    }));
    crypto_util_1.CryptoUtil.setConfigService(configService);
    const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
    app.setGlobalPrefix(apiPrefix);
    const corsOriginEnv = configService.get('CORS_ORIGIN') || 'http://localhost:3000';
    const allowedOrigins = corsOriginEnv.split(',').map(origin => origin.trim()).filter(Boolean);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) {
                if (isProduction) {
                    return callback(new Error('CORS: Origin header is required in production'));
                }
                if (nodeEnv === 'development') {
                    console.log('✅ Requisição sem Origin (app nativo/tool) - PERMITIDO [DEV ONLY]');
                }
                return callback(null, true);
            }
            if (allowedOrigins.includes(origin)) {
                if (nodeEnv === 'development') {
                    console.log(`✅ Origin permitido: ${origin}`);
                }
                return callback(null, true);
            }
            if (!isProduction && origin && origin.startsWith('http://localhost:')) {
                if (nodeEnv === 'development') {
                    console.log(`✅ Origin localhost permitido em dev: ${origin}`);
                }
                return callback(null, true);
            }
            if (isProduction) {
                console.warn(`⚠️  CORS bloqueado em produção: ${origin}`);
            }
            else {
                console.log(`❌ Origin bloqueado: ${origin}`);
            }
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-ID'],
        maxAge: isProduction ? 86400 : 0,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('PRIME API')
        .setDescription('API Backend for PRIME - Parkinson\'s Disease Clinical Assessment System')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addBasicAuth({
        type: 'http',
        scheme: 'basic',
        description: 'Enter username and password',
    }, 'Basic-auth')
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
    const enableSwagger = configService.get('ENABLE_SWAGGER') === 'true' || !isProduction;
    const swaggerUsername = configService.get('SWAGGER_USERNAME');
    const swaggerPassword = configService.get('SWAGGER_PASSWORD');
    if (enableSwagger) {
        if (isProduction && (!swaggerUsername || !swaggerPassword)) {
            console.warn('⚠️  ATENÇÃO: Swagger habilitado em produção sem autenticação! Configure SWAGGER_USERNAME e SWAGGER_PASSWORD.');
        }
        if (swaggerUsername && swaggerPassword) {
            app.use((req, res, next) => {
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
                    const base64Credentials = authHeader.split(' ')[1];
                    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
                    const [username, password] = credentials.split(':');
                    if (username === swaggerUsername && password === swaggerPassword) {
                        return next();
                    }
                    res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
                    return res.status(401).json({
                        statusCode: 401,
                        message: 'Invalid credentials',
                        error: 'Unauthorized',
                    });
                }
                return next();
            });
        }
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        });
    }
    else if (isProduction) {
        console.log('🔒 Swagger desabilitado em produção (configure ENABLE_SWAGGER=true para habilitar)');
    }
    const port = configService.get('PORT') || 4000;
    await app.listen(port);
    console.log(`🚀 PRIME API is running on: http://0.0.0.0:${port}/${apiPrefix}`);
    console.log(`🌍 Ambiente: ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
    if (enableSwagger) {
        if (swaggerUsername && swaggerPassword) {
            console.log(`📚 Swagger docs: http://0.0.0.0:${port}/api/docs (protegido com Basic Auth)`);
        }
        else {
            console.log(`⚠️  Swagger docs: http://0.0.0.0:${port}/api/docs (SEM AUTENTICAÇÃO - configure SWAGGER_USERNAME e SWAGGER_PASSWORD)`);
        }
    }
    if (isProduction) {
        console.log(`🔒 CORS configurado para: ${allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'NENHUMA ORIGEM (BLOQUEADO)'}`);
        console.log(`🛡️  Requisições sem Origin: BLOQUEADAS em produção`);
    }
    else {
        console.log(`🔒 CORS configurado para: ${allowedOrigins.join(', ') || 'nenhuma origem específica'}`);
        console.log(`📱 Apps nativos: permitidos (sem Origin) [DEV ONLY]`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map