"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const crypto_util_1 = require("./utils/crypto.util");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    crypto_util_1.CryptoUtil.setConfigService(configService);
    const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
    app.setGlobalPrefix(apiPrefix);
    app.enableCors({
        origin: configService.get('CORS_ORIGIN') || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-ID'],
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
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const port = configService.get('PORT') || 4000;
    await app.listen(port);
    console.log(`🚀 PRIME API is running on: http://localhost:${port}/${apiPrefix}`);
    console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map