import {BaseRouteTesting} from "../base.route";
import {INestApplication} from "@nestjs/common";
import {faker} from "@faker-js/faker";

export class CardTypeTesting extends BaseRouteTesting {
  constructor(app: INestApplication) {
    super(app, 'cards-types');
  }

  routeTest() {
    describe('route', () => {
      beforeAll(async () => {
        await this.createUser();
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
            return this.customPost('')
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
              });
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
      });
    });
  }
}