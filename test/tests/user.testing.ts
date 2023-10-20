import { INestApplication } from '@nestjs/common';
import {faker} from '@faker-js/faker'
import {BaseRouteTesting} from "../base.route";
export class UserTesting extends BaseRouteTesting {
    constructor(app: INestApplication) {
        super(app, 'user');
    }

    routeTest() {
        describe('route', () => {
            const commonEmail = faker.internet.email()
            beforeAll(async () => {
                await this.createAllUsers(commonEmail)
            })
            describe('user', () => {
                describe('post /users/auth/sign-up', () => {
                    it('should return 201 (create user with explicit role)', async () => {
                        await this.customPostWithoutAccessToken('auth/sign-up')
                            .withJson({
                                email: faker.internet.email(),
                                username: faker.internet.userName(),
                                password: 'Qwertyuiop123!',
                                role: 'Admin',
                            })
                            .expectStatus(201)
                            .expectJsonSchema({
                                type: 'object',
                                properties: {
                                    username: {
                                        type: 'string',
                                    },
                                    email: {
                                        type: 'string',
                                    },
                                    id: {
                                        type: 'string',
                                    },
                                    role: {
                                        type: 'string'
                                    }
                                },
                            })
                    });
                    it('should return 201 (create user with implicit role)', async () => {
                        await this.customPostWithoutAccessToken('auth/sign-up')
                          .withJson({
                              email: faker.internet.email(),
                              username: faker.internet.userName(),
                              password: 'Qwertyuiop123!',
                          })
                          .expectStatus(201)
                          .expectJsonSchema({
                              type: 'object',
                              properties: {
                                  username: {
                                      type: 'string',
                                  },
                                  email: {
                                      type: 'string',
                                  },
                                  id: {
                                      type: 'string',
                                  },
                                  role: {
                                      type: 'string'
                                  }
                              },
                          })
                    });
                    it('should return 409 (user already exists)', async () => {
                        await this.customPostWithoutAccessToken('auth/sign-up')
                          .withJson({
                              email: commonEmail,
                              username: faker.internet.userName(),
                              password: 'Qwertyuiop123!',
                          })
                          .expectStatus(409)
                          .expectJsonSchema({
                              type: 'object',
                              properties: {
                                  statusCode: {
                                      type: 'number',
                                  },
                                  message: {
                                      type: 'string',
                                  },
                                  error: {
                                      type: 'string',
                                  },
                              },
                          })
                    });
                });
                describe('post /users/auth/login', () => {
                    it('should return 200 (login)', async () => {
                        await this.customPostWithoutAccessToken('auth/login')
                          .withJson({
                              email: commonEmail,
                              password: this.commonUser.password,
                          })
                          .expectStatus(200)
                          .expectJsonSchema({
                              type: 'object',
                              properties: {
                                  access_token: {
                                      type: 'string',
                                  },
                              },
                          })
                    });
                });
                describe('get /users/me', () => {
                    it('should return 401', (): any => {
                        return this.customGetWithoutAccessToken('me').expectStatus(401);
                    });
                    this.itu('should return 200', async () => {
                        return this.customGet('me')
                          .expectStatus(200)
                          .expectJsonSchema({
                              type: 'object',
                              properties: {
                                  username: {
                                      type: 'string',
                                  },
                                  email: {
                                      type: 'string',
                                  },
                                  id: {
                                      type: 'string',
                                  },
                                  role: {
                                      type: 'string',
                                  },
                              },
                          })
                          .expectBodyContains(this.user.email);
                    });
                });
                describe('get /users/', () => {
                    it('should return 401', (): any => {
                        return this.customGetWithoutAccessToken('').expectStatus(401);
                    });
                    this.itu('should return 200', async () => {
                        return this.find()
                          .expectStatus(200)
                          .expectJsonSchema({
                              type: 'array',
                              items: {
                                  type: 'object',
                                  properties: {
                                      username: {
                                          type: 'string',
                                      },
                                      email: {
                                          type: 'string',
                                      },
                                      id: {
                                          type: 'string',
                                      },
                                      role: {
                                          type: 'string',
                                      },
                                  },
                              },
                          });
                    });
                });
                describe('get /users/{id}', () => {
                    this.itu('should return 400', async () => {
                        return this.findById('id').expectStatus(400);
                    });
                    this.itu('should return 404', async () => {
                        return this.findById(
                          '187e020c-4c74-4a44-996c-6e8100523413',
                        ).expectStatus(404);
                    });
                    this.itu('should return 200', async () => {
                        const id: string = await this.find().returns('[0].id');
                        return this.findById(id)
                          .expectStatus(200)
                          .expectJsonSchema({
                              type: 'object',
                              properties: {
                                  username: {
                                      type: 'string',
                                  },
                                  email: {
                                      type: 'string',
                                  },
                                  id: {
                                      type: 'string',
                                  },
                              },
                          });
                    });
                });
                describe('put /users/{id}', () => {
                    this.itu('should return 400', async () => {
                        return this.customPut('id')
                          .withJson({
                              email: faker.internet.email(),
                              username: faker.internet.userName(),
                              password: 'Qwertyuiop123!',
                          })
                          .expectStatus(400);
                    });
                    this.itu('should return 404', async () => {
                        return this.customPut('187e020c-4c74-4a44-996c-6e8100523413')
                          .withJson({
                              email: faker.internet.email(),
                              username: faker.internet.userName(),
                              password: 'Qwertyuiop123!',
                          })
                          .expectStatus(404);
                    });
                    this.itu('should return 200', async () => {
                        let id = await this.customPostWithoutAccessToken('auth/sign-up')
                          .withJson({
                              email: faker.internet.email(),
                              username: faker.internet.userName(),
                              password: 'Qwertyuiop123!'
                          }).returns('id')
                        return this.customPut(id)
                          .withJson({
                              email: faker.internet.email(),
                              username: faker.internet.userName(),
                              password: 'Qwertyuiop123!',
                          })
                          .expectStatus(200)
                          .expectJsonSchema({
                              type: 'object',
                              properties: {
                                  username: {
                                      type: 'string',
                                  },
                                  email: {
                                      type: 'string',
                                  },
                                  id: {
                                      type: 'string',
                                  },
                              },
                          });
                    });
                });
                describe('delete /users/{id}', () => {
                    this.itu('should return 400', async () => {
                        return this.customDelete('id').expectStatus(400);
                    });
                    this.itu('should return 404', async () => {
                        return this.customDelete('187e020c-4c74-4a44-996c-6e8100523413').expectStatus(404);
                    });
                    this.itu('should return 200', async () => {
                        let id = await this.customPostWithoutAccessToken('auth/sign-up')
                          .withJson({
                              email: faker.internet.email(),
                              username: faker.internet.userName(),
                              password: 'Qwertyuiop123!'
                          }).returns('id')
                        return this.customDelete(id).expectStatus(200);
                    });
                });
            });
        });
    }
}
