import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

  app.enableCors({
    origin: config.get('app.nodeEnv') === 'production' ? false : true,
    credentials: true,
  });

  app.setGlobalPrefix(config.get<string>('app.apiPrefix') ?? 'api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = config.get<number>('app.port') ?? 3000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}/api/v1`);
}

bootstrap();
