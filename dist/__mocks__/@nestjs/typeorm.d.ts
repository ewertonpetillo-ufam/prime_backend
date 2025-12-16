import 'reflect-metadata';
import { DataSourceOptions } from 'typeorm';
declare function getRepositoryToken(entity: Function | string): string;
export declare function InjectRepository(entity: Function): PropertyDecorator & ParameterDecorator;
export declare const TypeOrmModule: {
    forRoot: jest.Mock<any, any, any>;
    forRootAsync: jest.Mock<any, any, any>;
    forFeature: jest.Mock<any, any, any>;
};
export type TypeOrmModuleOptions = DataSourceOptions & {
    retryAttempts?: number;
    retryDelay?: number;
    toRetry?: (err: any) => boolean;
    keepConnectionAlive?: boolean;
    verboseRetryLog?: boolean;
    autoLoadEntities?: boolean;
};
export { getRepositoryToken };
