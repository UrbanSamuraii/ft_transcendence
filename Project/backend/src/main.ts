import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { UnauthorizedExceptionFilter } from './auth/filters/unauthorized-exception.filter';
import { ForbiddenExceptionFilter } from './auth/filters/forbidden-exception.filter';
import * as cookieParser from 'cookie-parser';
import * as passport from "passport";
import { WebsocketAdapter } from './gateway/gateway.adapter';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const port = +process.env.APP_PORT || 3001;
    const server_adress = process.env.SERVER_ADRESS;

    const adapter = new WebsocketAdapter(app);
    app.useWebSocketAdapter(adapter);

    app.use(passport.initialize());
    app.enableCors({
        origin: `http://${server_adress}:3000`,
        credentials: true,
    });
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
    }));
    app.use(cookieParser());
    app.useGlobalFilters(
        new UnauthorizedExceptionFilter(),
        new ForbiddenExceptionFilter(),
    );
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
        prefix: '/uploads/', // Virtual prefix to access files in the browser
    });
    await app.listen(port);
    
    
    // Gracefully shutdown the server.
    app.enableShutdownHooks();
}

bootstrap();
