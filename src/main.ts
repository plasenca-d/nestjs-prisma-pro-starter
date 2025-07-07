import { NestFactory } from '@nestjs/core';

import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.useLogger(app.get(Logger));

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
