import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestComAuthETenant } from '../guards/unified.guard';

/**
 * Decorator para extrair o ID do usuário atual da requisição.
 * O UnifiedGuard com @RequireAuth() garante que authSession existe.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestComAuthETenant>();
    return request.authSession!.userId;
  },
);
