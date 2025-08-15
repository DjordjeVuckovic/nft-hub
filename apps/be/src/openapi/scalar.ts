import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { apiReference } from '@scalar/nestjs-api-reference';

export const configScalar = (app: INestApplication) => {
	const doc = new DocumentBuilder()
		.setTitle('NFT Hub API')
		.setDescription('API documentation for the NFT Hub app')
		.setVersion('1.0')
		.addBearerAuth()
		.addTag('nfts', 'NFT operations')
		.build();

	const swaggerDoc = SwaggerModule.createDocument(app, doc);
	app.use(
		'/scalar',
		apiReference({
			theme: 'elysiajs',
			darkMode: true,
			content: swaggerDoc,
		}),
	);
};
