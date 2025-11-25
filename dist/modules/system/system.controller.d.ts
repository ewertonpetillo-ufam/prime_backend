import { SystemService } from './system.service';
export declare class SystemController {
    private readonly systemService;
    constructor(systemService: SystemService);
    getBuildInfo(): {
        version: any;
        name: any;
    };
}
