"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    constructor() {
        this.logger = new common_1.Logger(AllExceptionsFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors = null;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                message =
                    exceptionResponse.message || exception.message;
                errors = exceptionResponse.errors || null;
            }
            else {
                message = exceptionResponse;
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
            if ('code' in exception) {
                status = this.mapDatabaseError(exception);
                message = this.getDatabaseErrorMessage(exception);
            }
        }
        const shouldLog = !this.shouldIgnoreError(request.url, status, message);
        if (shouldLog) {
            this.logger.error(`${request.method} ${request.url} - Status: ${status} - ${message}`, exception instanceof Error ? exception.stack : undefined);
        }
        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message,
            ...(errors && { errors }),
        };
        response.status(status).json(errorResponse);
    }
    mapDatabaseError(error) {
        const code = error.code;
        switch (code) {
            case '23505':
                return common_1.HttpStatus.CONFLICT;
            case '23503':
                return common_1.HttpStatus.BAD_REQUEST;
            case '23502':
                return common_1.HttpStatus.BAD_REQUEST;
            case '22001':
                return common_1.HttpStatus.BAD_REQUEST;
            case '22P02':
                return common_1.HttpStatus.BAD_REQUEST;
            case '23514':
                return common_1.HttpStatus.BAD_REQUEST;
            default:
                return common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
    getDatabaseErrorMessage(error) {
        const code = error.code;
        switch (code) {
            case '23505':
                return 'A record with this value already exists';
            case '23503':
                return 'Referenced record does not exist';
            case '23502':
                return 'Required field cannot be null';
            case '22001':
                return 'Data value is too long for this field';
            case '22P02':
                return 'Invalid data format for this field';
            case '23514':
                return 'Value does not meet constraint requirements';
            default:
                return error.message || 'Database operation failed';
        }
    }
    shouldIgnoreError(url, status, message) {
        if (url === '/api/v1' && status === 401) {
            return true;
        }
        if (status === 404) {
            const ignoredPaths = [
                '/favicon.ico',
                '/robots.txt',
                '/login/css/',
                '/login/js/',
                '/login/images/',
                '.css',
                '.js',
                '.png',
                '.jpg',
                '.jpeg',
                '.gif',
                '.ico',
                '.svg',
            ];
            return ignoredPaths.some((path) => url.includes(path));
        }
        return false;
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=http-exception.filter.js.map