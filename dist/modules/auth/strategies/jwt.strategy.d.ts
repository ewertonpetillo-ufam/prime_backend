import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
export interface JwtPayload {
    client_id: string;
    iat: number;
    exp: number;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    constructor(configService: ConfigService);
    validate(payload: JwtPayload): Promise<{
        client_id: string;
    }>;
}
export {};
