import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { CONFIG_PROVIDER } from '../config/config.provider';
import { type AppConfig } from '../config/config.types';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(@Inject(CONFIG_PROVIDER) private readonly config: AppConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKeyFromRequest(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    if (apiKey !== this.config.authConfig.apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }

  private extractApiKeyFromRequest(request: any): string | null {

    const apiKeyHeader = request.headers['x-api-key'];
    if (apiKeyHeader) {
      return apiKeyHeader;
    }

    return null;
  }
}