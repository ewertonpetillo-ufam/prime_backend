"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = void 0;
const getDatabaseConfig = (configService) => {
    return {
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
        autoLoadEntities: true,
        extra: {
            max: 20,
            connectionTimeoutMillis: 5000,
        },
    };
};
exports.getDatabaseConfig = getDatabaseConfig;
//# sourceMappingURL=database.config.js.map