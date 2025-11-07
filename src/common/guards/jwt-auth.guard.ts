import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const url = request.url;

    // Allow Swagger UI and related assets without authentication
    if (
      url.startsWith('/api/docs') ||
      url.startsWith('/api/docs/') ||
      url.startsWith('/api/docs-json') ||
      url.startsWith('/api/docs-yaml') ||
      url.includes('swagger-ui') ||
      url.includes('swagger.json') ||
      url.includes('favicon.ico')
    ) {
      return true;
    }

    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
