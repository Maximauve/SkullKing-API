import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

let server: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule,  { cors: true });

  await app.startAllMicroservices();
  await app.init();
}
bootstrap();

export const handler: any = async (
    event: any,
    context: any,
    callback: any,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
