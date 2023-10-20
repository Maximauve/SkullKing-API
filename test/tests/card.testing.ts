import {BaseRouteTesting} from "../base.route";
import {INestApplication} from "@nestjs/common";

export class CardTesting extends BaseRouteTesting {
  constructor(app: INestApplication) {
    super(app, 'cards');
  }

  routeTest() {
    describe('route', () => {
      describe('cards', () => {
        describe('post /cards', () => {
          it('should return 401', (): any => {
            return this.customPostWithoutAccessToken('')
              .withJson({
                name: 'Test',
                img_path: 'Test',
                value: Math.floor(Math.random() * (14 - 1)) + 1
              })
              .expectStatus(401);
          });
          it('should return 201', async () => {
            await this.setAccessToken();
            return this.customPostPrivate('')
              .withJson({
                name: 'Test',
                img_path: 'Test',
                value: Math.floor(Math.random() * (14 - 1)) + 1
              })
              .expectStatus(201)
              .expectJsonSchema({
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                  },
                  name: {
                    type: 'string',
                  }
                },
              });
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
                      type: 'string',
                    },
                    name: {
                      type: 'string',
                    },
                    image: {
                      type: 'string',
                    },
                    color: {
                      type: 'string',
                    },
                    value: {
                      type: 'number',
                    },
                    type: {
                      type: 'string',
                    },
                    createdAt: {
                      type: 'string',
                    },
                    updatedAt: {
                      type: 'string',
                    },
                  },
                },
              });
          });
        });
      });
    });
  }
}