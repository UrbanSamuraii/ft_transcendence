import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { deepStrictEqual } from 'assert';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = +process.env.APP_PORT || 4000;
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));
  await app.listen(port);
}
bootstrap();

// Instanciate a global Validation Pipe - validate the data before treating it as a paramater (dto)
// Setting the whitelist to True to get only the data required and designed in the dto