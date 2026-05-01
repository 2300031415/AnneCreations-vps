import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
dotenv.config();
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as path from 'path';
import * as fs from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security - allow images to load (disable some helmet restrictions for static files)
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  }));
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow all origins but echo the origin to support credentials
      callback(null, true);
    },
    credentials: true,
  });

  // Serve catalog images as static files
  // Look for the catalog folder in several possible locations
  const catalogPaths = [
    path.join(process.cwd(), 'catalog'),
    path.join('D:\\FinalVersion-Annecreations-main\\FinalVersion-Annecreations-main\\Backend\\catalog'),
    path.join('D:\\Anne-Creations-main\\Backend\\catalog'),
  ];
  
  let catalogPath = catalogPaths.find(p => fs.existsSync(p));
  if (catalogPath) {
    app.useStaticAssets(catalogPath, { prefix: '/catalog' });
    console.log(`📁 Serving catalog images from: ${catalogPath}`);
  } else {
    console.warn('⚠️  catalog folder not found - product images will not serve');
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false, // Allow extra fields gracefully
    }),
  );

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  // Swagger integration
  const config = new DocumentBuilder()
    .setTitle('AnneCreations REST API')
    .setDescription(
      'The API description for AnneCreations backend built with NestJS',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AnneCreations API Documentation',
  });

  const PORT = process.env.PORT || 5000;
  await app.listen(PORT, '0.0.0.0');
  console.log(`🚀 NestJS Server running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🖼️  Images at: http://localhost:${PORT}/catalog/product/<filename>`);
}
bootstrap();
