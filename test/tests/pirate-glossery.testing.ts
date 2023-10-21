import {BaseRouteTesting} from "../base.route";
import {INestApplication} from "@nestjs/common";
import {faker} from "@faker-js/faker";

export class PirateGlosseryTesting extends BaseRouteTesting {
  constructor(app: INestApplication) {
    super(app, 'pirate-glossary');
  }

  routeTest() {
    describe('route', () => {
      beforeAll(async () => {
        await this.createUser();
        await this.setAccessToken();
      });
      describe('pirate-glossary', () => {
        describe('get /pirate-glossary', () => {
          it('should return 200', async () => {
            return this.customGet('')
              .expectStatus(200)
              .expectJsonSchema({
                type: 'object',
                properties: {
                  room: {
                    type: 'string',
                    pattern: '^[a-z-]+-[a-z-]+-[a-z-]+$'
                  },
                },
              });
          });
        });
        describe('post /pirate-glossery', () => {
          it('should return 201', async () => {
            return this.customPost('')
              .withJson({
                word: faker.lorem.word(),
              })
              .expectStatus(201)
              .expectJsonSchema({
                type: 'object',
                properties: {
                  id: {
                    type: 'number',
                  },
                  room: {
                    type: 'string',
                    pattern: '^[a-z-]+-[a-z-]+-[a-z-]+$'
                  },
                },
              });
          });
          it('should return 201', async () => {
            return this.customPost('')
              .withJson({
                word: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()]
              })
              .expectStatus(201)
              .expectJsonSchema({
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "number"
                    },
                    word: {
                      type: "string"
                    }
                  }
                }
              });
          });
        });
      });
    });
  }
}