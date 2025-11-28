/**
 * PrismaService - Serviço Singleton de Conexão com Banco de Dados
 *
 * Este serviço é responsável por:
 * - Gerenciar a conexão com o PostgreSQL
 * - Fornecer o Prisma Client para todos os módulos
 * - Implementar lifecycle hooks para abrir/fechar conexão
 * - Configurar logging de queries SQL
 *
 * Características:
 * - Singleton: Uma única instância é compartilhada por toda a aplicação
 * - Type-safe: Prisma gera tipos TypeScript baseados no schema
 * - Auto-reconnect: Reconecta automaticamente em caso de falha
 * - Connection pooling: Gerencia pool de conexões automaticamente
 *
 * Usado por:
 * - AuthService: CRUD de usuários
 * - SitesService: CRUD de sites e domínios
 * - EventsService: Inserção de eventos
 * - OverviewService, SearchService, PropertyService, ConversionService: Queries SQL para analytics
 * - HealthService: Health check do banco
 * - Guards: UnifiedGuard busca sites
 *
 * Lifecycle:
 * 1. onModuleInit: Conecta ao banco quando o módulo é iniciado
 * 2. Durante execução: Mantém connection pool ativo
 * 3. onModuleDestroy: Desconecta quando a aplicação é encerrada
 */

import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const nodeEnv = process.env.NODE_ENV;
    const isDevelopment = nodeEnv === 'development';

    // Inicializa o PrismaClient com configurações de logging
    super({
      log: isDevelopment
        ? ['query', 'error', 'warn'] // Em dev: loga queries SQL
        : ['error'], // Em prod: loga apenas erros
    });
  }

  /**
   * Hook executado quando o módulo é inicializado
   * Estabelece conexão com o banco de dados
   */
  async onModuleInit() {
    try {
      // Conecta ao PostgreSQL usando a URL do .env
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (error) {
      // Se falhar, loga erro e propaga exceção (app não inicia)
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  /**
   * Hook executado quando o módulo é destruído
   * Fecha a conexão com o banco de dados gracefully
   */
  async onModuleDestroy() {
    // Desconecta e fecha todas as conexões do pool
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }
}
