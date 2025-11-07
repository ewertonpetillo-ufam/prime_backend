import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message =
          (exceptionResponse as any).message || exception.message;
        errors = (exceptionResponse as any).errors || null;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;

      // Handle PostgreSQL/TypeORM errors
      if ('code' in exception) {
        status = this.mapDatabaseError(exception as any);
        message = this.getDatabaseErrorMessage(exception as any);
      }
    }

    // Ignore common non-critical errors to reduce log noise
    const shouldLog = !this.shouldIgnoreError(request.url, status, message);

    if (shouldLog) {
      this.logger.error(
        `${request.method} ${request.url} - Status: ${status} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    // Send response
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

  private mapDatabaseError(error: any): HttpStatus {
    const code = error.code;

    switch (code) {
      case '23505': // unique_violation
        return HttpStatus.CONFLICT;
      case '23503': // foreign_key_violation
        return HttpStatus.BAD_REQUEST;
      case '23502': // not_null_violation
        return HttpStatus.BAD_REQUEST;
      case '22001': // string_data_right_truncation
        return HttpStatus.BAD_REQUEST;
      case '22P02': // invalid_text_representation
        return HttpStatus.BAD_REQUEST;
      case '23514': // check_violation
        return HttpStatus.BAD_REQUEST;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private getDatabaseErrorMessage(error: any): string {
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

  private shouldIgnoreError(url: string, status: number, message: string): boolean {
    // Ignore healthcheck requests (HEAD /api/v1)
    if (url === '/api/v1' && status === 401) {
      return true;
    }

    // Ignore common 404s
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
}
