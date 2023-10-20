import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {MicroserviceOptions, Transport} from "@nestjs/microservices";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

  const microserviceOptions: MicroserviceOptions = {
  // @ts-ignore
    transport: Transport.REDIS,
    options: {
      url: 'redis://localhost:6379',
    },
  };

  app.connectMicroservice(microserviceOptions);

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
