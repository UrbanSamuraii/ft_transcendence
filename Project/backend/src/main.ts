import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as passport from "passport";
import * as cors from 'cors';

async function bootstrap() {
    // const app = await NestFactory.create(AppModule);
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // const port = +process.env.APP_PORT || 4000;
    const port = 3001;
    // Initialize Passport
    app.use(cookieParser()); // Add cookie parser middleware if needed
    app.use(passport.initialize());
    app.use(cors());
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
    }));
    app.use(cookieParser()); // cookie parser middleware
    await app.listen(port);
}
bootstrap();

// Instanciate a global Validation Pipe - validate the data before treating it as a paramater (dto)
// Setting the whitelist to True to get only the data required and designed in the dto