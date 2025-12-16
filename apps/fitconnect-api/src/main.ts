import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS zodat Angular mag praten met de API
  app.enableCors({
    origin: 'http://localhost:4200',
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
