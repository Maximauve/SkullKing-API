import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as pactum from 'pactum';
import {UserTesting} from "./tests/user.testing";
import {CardTesting} from "./tests/card.testing";
import {CardTypeTesting} from "./tests/card-type.testing";
import {PirateGlosseryTesting} from "./tests/pirate-glossery.testing";

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, { cors: true });
    await app.listen(3000);

    pactum.request.setBaseUrl('http://localhost:3000');
  });
  const tab: any =  {
    userIds: [],
    cardTypeIds: [],
    cardIds: [],
    pirateGlosseryIds: [],
  };

  new UserTesting(app, tab).routeTest();
  new CardTesting(app, tab).routeTest();
  new CardTypeTesting(app, tab).routeTest();
  new PirateGlosseryTesting(app, tab).routeTest();
});
