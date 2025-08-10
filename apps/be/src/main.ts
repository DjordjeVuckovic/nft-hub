import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {configureScalar} from "./openapi/scalar";
import {loadConfig} from "./config";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    loadConfig()

    configureScalar(app)

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
