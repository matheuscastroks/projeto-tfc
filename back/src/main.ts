import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  Logger,
  BadRequestException,
  ValidationError,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);
    const port = configService.get<number>('port') || 3001;

    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", '*'],
            styleSrc: ["'self'", "'unsafe-inline'", '*'],
            imgSrc: ["'self'", 'data:', '*'],
            connectSrc: ["'self'", '*'],
            fontSrc: ["'self'", '*'],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'", '*'],
            frameSrc: ["'self'", '*'],
          },
        },
        // SDK pode ser carregado em frames de outros sites
        frameguard: false,
        // SDK pode buscar recursos de qualquer origem
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
      }),
    );

    // Middleware de compressão gzip nas respostas HTTP
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    app.use(compression());

    app.use(cookieParser());

    // Config CORS: Libera qualquer origem para endpoints do SDK
    app.enableCors({
      origin: (origin, callback) => {
        callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Site-Key'],
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Remove o que não está no DTO
        forbidNonWhitelisted: false, // Permite extras (SDKs não quebram)
        transform: true, // Converte tipos automaticamente
        transformOptions: {
          enableImplicitConversion: true, // string pra number etc
        },
        validationError: {
          target: false, // não mostra objeto original no erro
          value: false, // não mostra valor inválido (evita expor dados sensíveis)
        },
        exceptionFactory: (errors: ValidationError[]) => {
          // Formata os erros para facilitar debug
          const formatError = (error: ValidationError) => ({
            property: error.property,
            constraints: error.constraints,
            children: error.children?.map(formatError),
          });
          const formatted = errors.map(formatError);
          console.error(
            'Validation Errors:',
            JSON.stringify(formatted, null, 2),
          );
          return new BadRequestException({
            message: 'Validation failed',
            errors: formatted,
          });
        },
      }),
    );

    app.setGlobalPrefix('api');

    app.useGlobalInterceptors(new LoggingInterceptor());

    const swaggerConfig = new DocumentBuilder()
      .setTitle('InsightHouse Analytics API')
      .setDescription(
        'API de analytics web e rastreamento de eventos com multi-clientes. ' +
          'Monitore usuários, conversões e veja insights.',
      )
      .setVersion('1.0.1')
      .setContact(
        'Equipe InsightHouse',
        'https://github.com/Couks',
        'matheuscastroks@gmail.com',
      )
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      // Tags para organização da docs
      .addTag('Authentication', 'Login de usuário e sessões')
      .addTag('Sites', 'Gerenciar sites e multi-tenant')
      .addTag('Events', 'Rastreamento e ingestão de eventos')
      .addTag('Insights - Overview', 'Visão geral dos dados e métricas')
      .addTag('Insights - Search', 'Busca e filtros')
      .addTag('Insights - Property', 'Analytics detalhado dos imóveis')
      .addTag('Insights - Conversion', 'Conversões, origens e leads')
      .addTag('SDK', 'SDK e configuração do cliente')
      .addTag('Health', 'Status da API e healthcheck')
      // Auth por cookie (admin) na documentação
      .addCookieAuth(
        'admin_session',
        {
          type: 'apiKey',
          in: 'cookie',
          name: 'admin_session',
          description: 'Cookie da sessão admin',
        },
        'session-auth',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-Site-Key',
          in: 'header',
          description:
            'Chave do site para identificar cliente/multi-tenant e rastrear eventos',
        },
        'site-key',
      )
      .addServer('http://localhost:3001')
      .addServer('https://api.matheuscastroks.com.br')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig, {
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        `${controllerKey}_${methodKey}`,
    });

    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // Mantém login entre reloads
        docExpansion: 'none', // Tudo fechado por padrão
        filter: true, // Buscar endpoints
        showRequestDuration: true, // Tempo da request
        syntaxHighlight: {
          theme: 'monokai', // Tema escuro
        },
        tryItOutEnabled: true, // Permite testar endpoints direto
      },
      customSiteTitle: 'API InsightHouse Docs',
      customfavIcon: '/favicon.ico',
      // CSS para visual mais limpo
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 50px 0 }
        .swagger-ui .scheme-container { background: #fafafa; padding: 20px 0 }
      `,
    });

    await app.listen(port);

    logger.log(`Env: ${configService.get<string>('nodeEnv')}`);
    logger.log(
      `Swagger JSON: https://api.matheuscastroks.com.br/api/docs-json`,
    );
  } catch (error) {
    // Se der erro na inicialização, mostra o erro e encerra
    logger.error(
      'Erro ao iniciar aplicação:',
      error instanceof Error ? error.stack : String(error),
    );
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Erro fatal no bootstrap:', error);
  process.exit(1);
});
