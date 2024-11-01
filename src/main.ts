import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ParseIntIdPipe } from './common/pipes/parse-int-id-pipe';
import { AddHeaderInterceptor } from './common/interceotors/add-header-interceptor';
import { TimeConnectionInterceptor } from './common/interceotors/time-connectioninterceptor';
import { ErrorInterceptor } from './common/interceotors/error-interceptor';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove chaves que não estão no DTO
      forbidNonWhitelisted: true, // levantar erro quando a chave não existir
      transform: false, // tenta transformar os tipos de dados de param e dtos
    }),
    new ParseIntIdPipe()
  )
  app.useGlobalInterceptors(
    new TimeConnectionInterceptor(),
    new ErrorInterceptor(),
    new AddHeaderInterceptor()
  );

  //Adiconar cabeçalhos de segurança
  if (process.env.NODE_ENV === 'production') {
    //helmet -> cabealhos de segurança no protocolo HTTP
    app.use(helmet());
    //cors -> permitir que outro domínio faça requests na sua api
    app.enableCors()
  }

  await app.listen(process.env.APP_PORT);
}
bootstrap();
