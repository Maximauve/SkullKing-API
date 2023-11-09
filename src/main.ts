import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,  { cors: true });



  await app.startAllMicroservices();
  await app.listen(+process.env.PORT);
}
bootstrap();
export function handler(...args) {
  console.log("HANDLER -> ", args);
}
export default function (...args) {
  console.log(args)
};
