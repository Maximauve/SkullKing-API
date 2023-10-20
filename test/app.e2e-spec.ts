import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as pactum from 'pactum';
import {UserTesting} from "./tests/user.testing";
import {CardTesting} from "./tests/card.testing";
import {CardTypeTesting} from "./tests/card-type.testing";

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, { cors: true });
    await app.listen(3000);

    pactum.request.setBaseUrl('http://localhost:3000');
  });

  new UserTesting(app).routeTest();
  new CardTypeTesting(app).routeTest();
  // new CardTesting(app).routeTest();
});
