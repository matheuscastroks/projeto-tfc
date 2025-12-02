import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestComAuthETenant } from '../guards/unified.guard';

/**
 * Decorator para extrair a siteKey do request
 * O UnifiedGuard com @RequireTenant() garante que o tenant exista
 */
export const SiteKey = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestComAuthETenant>();
    return request.tenant!.siteKey;
  },
);
