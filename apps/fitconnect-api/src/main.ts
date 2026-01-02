import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';

// Load dotenv first from project root, then override with app-specific .env
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
const appEnv = path.resolve(process.cwd(), 'apps/fitconnect-api/.env');
if (fs.existsSync(appEnv)) {
  require('dotenv').config({ path: appEnv });
}


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS zodat Angular mag praten met de API
  app.enableCors({
    origin: 'http://localhost:4200',
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Log incoming Authorization header for debugging auth issues
  app.use((req: any, _res: any, next: any) => {
    try {
      console.log('Incoming Authorization header:', req.headers?.authorization);
    } catch (e) {
      // noop
    }
    next();
  });

  // validatie op basis van DTO's
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // extra velden worden weggehaald
      forbidNonWhitelisted: true, // fout als iemand onbekende velden stuurt
      transform: true,            // automatisch omzetten naar juiste types
    }),
  );

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3333;
  await app.listen(port);
  console.log(`Listening at http://localhost:${port}/${globalPrefix}`);
}
bootstrap();
