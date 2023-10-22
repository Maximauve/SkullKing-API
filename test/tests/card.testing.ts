import {BaseRouteTesting} from "../base.route";
import {INestApplication} from "@nestjs/common";
import {faker} from "@faker-js/faker";

export class CardTesting extends BaseRouteTesting {
  constructor(app: INestApplication, allIds: {}) {
    super(app, 'cards', allIds);
  }

  routeTest() {
    describe('route', () => {
      beforeAll(async () => {
        await this.createUser(this.allIds);
        await this.setAccessToken();
        this.allIds = await this.createCardType(this.allIds);
      })
      describe('cards', () => {
        describe('post /cards', () => {
          it('should return 401', (): any => {
            return this.customPostWithoutAccessToken('')
              .withJson({
                img_path: faker.image.url(),
                value: Math.floor(Math.random() * (14 - 1)) + 1,
                type: this.cardType
              })
              .expectStatus(401);
          });
          it('should return 201', async () => {
            await this.setAccessToken();
            let id = await this.customPost('')
              .withJson({
                img_path: faker.image.url(),
                value: Math.floor(Math.random() * (14 - 1)) + 1,
                type: this.cardType
              })
              .expectStatus(201)
              .expectJsonSchema({
                type: 'object',
                properties: {
                  id: {
                    type: 'number',
                  },
                  img_path: {
                    type: 'string',
                  },
                  value: {
                    type: 'number',
                  },
                  type: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                      },
                      name: {
                        type: 'string',
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
                    }
                  }
                },
              }).returns('id');
            this.allIds.cardIds = [...this.allIds.cardIds, id];
          });
        });
        describe('get /cards', () => {
          it('should return 401', (): any => {
            return this.customGetWithoutAccessToken('').expectStatus(401);
          });
          it('should return 200', async () => {
            return this.find()
              .expectStatus(200)
              .expectJsonSchema({
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number',
                    },
                    value: {
                      anyOf: [
                        {
                          type: 'number',
                        },
                        {
                          type: 'string',
                        }
                      ]
                    },
                    img_path: {
                      type: 'string',
                    },
                    type: {
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
                      }
                    }
                  },
                },
              });
          });
        });
      });
      afterAll(async () => {
        await this.deleteAll(this.allIds);
      });
    });
  }
}