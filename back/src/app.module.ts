import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SitesModule } from './sites/sites.module';
import { SdkModule } from './sdk/sdk.module';
import { EventsModule } from './events/events.module';
import { InsightsModule } from './insights/insights.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // ConfigModule: SEMPRE PRIMEIRO - Carrega variáveis de ambiente (.env)
    ConfigModule,

    // PrismaModule: SEGUNDO - Estabelece conexão com PostgreSQL
    PrismaModule,

    // ThrottlerModule: Rate limiting global
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Time to live: 1 minuto (60000ms)
        limit: 100, // Máximo de 100 requisições neste período
      },
    ]),

    // AuthModule: Autenticação e gerenciamento de sessões
    AuthModule,

    // SitesModule: CRUD de sites e domínios (multi-tenancy)
    SitesModule,

    // SdkModule: Serve o SDK JavaScript e configurações para clientes
    SdkModule,

    // EventsModule: Ingestão de eventos de analytics
    EventsModule,

    // InsightsModule: Queries de analytics e geração de insights
    InsightsModule,

    // HealthModule: Health checks e monitoramento
    HealthModule,
  ],
})
export class AppModule {}
