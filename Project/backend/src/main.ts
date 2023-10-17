import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as passport from "passport";
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const port = +process.env.APP_PORT || 3001;

    // Initialize Passport
    app.use(passport.initialize());
    app.enableCors({
        origin: 'http://localhost:3000', // Update with your frontend URL
        credentials: true, // If needed
    });
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
    }));
    app.use(cookieParser()); // cookie parser middleware
    await app.listen(port);
}

bootstrap();


// Instanciate a global Validation Pipe - validate the data before treating it as a paramater (dto)
// Setting the whitelist to True to get only the data required and designed in the dto