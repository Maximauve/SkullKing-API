import {BaseRouteTesting} from "../base.route";
import {INestApplication} from "@nestjs/common";
import {faker} from "@faker-js/faker";

export class CardTypeTesting extends BaseRouteTesting {
  constructor(app: INestApplication, allIds: {}) {
    super(app, 'cards-types', allIds);
  }

  routeTest() {
    describe('route', () => {
      beforeAll(async () => {
        await this.createUser(this.allIds);
      })
      describe('cards-types', () => {
        describe('post /cards-types', () => {
          it('should return 401', (): any => {
            return this.customPostWithoutAccessToken('')
              .withJson({
                name: faker.lorem.word,
                superior_to: []
              })
              .expectStatus(401);
          });
          it('should return 201', async () => {
            await this.setAccessToken();
            let id = await this.customPost('')
              .withJson({
                name: faker.lorem.word(),
                superior_to: []
              })
              .expectStatus(201)
              .expectJsonSchema({
                type: 'object',
                properties: {
                  id: {
                    type: 'number',
                  },
                  name: {
                    type: 'string',
                  },
                  superior_to: {
                    type: 'array',
                  },
                  circular_winner: {
                    anyOf: [
                      {
                        type: 'boolean',
                      },
                      {
                        type: 'null',
                      },
                    ],
                  }
                },
              }).returns('id');
            this.allIds.cardTypeIds = [...this.allIds.cardTypeIds, id];
          });
        });
        describe('get /cards-types', () => {
          it('should return 401', (): any => {
            return this.customGetWithoutAccessToken('').expectStatus(401);
          });
          it('should return 200', async () => {
            await this.setAccessToken();
            return this.customGet('')
              .expectStatus(200)
              .expectJsonSchema({
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number',
                    },
                    name: {
                      type: 'string',
                    },
                    superior_to: {
                      type: 'array',
                    },
                    circular_winner: {
                      anyOf: [
                        {
                          type: 'boolean',
                        },
                        {
                          type: 'null',
                        },
                      ],
                    }
                  },
                },
              });
          });
        });
        afterAll(async () => {
          await this.deleteAll(this.allIds);
        });
      });
    });
  }
}