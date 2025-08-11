import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {configScalar} from "./openapi/scalar";
import { config as configDotenv } from 'dotenv';

async function bootstrap() {
    configDotenv();

    const app = await NestFactory.create(AppModule);

    configScalar(app)

    app.enableCors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    await app.listen(process.env.PORT ?? 1312);
}

bootstrap().then(() => {
    console.log(`Server is running on port ${process.env.PORT ?? 1312} 🤑`);
});
