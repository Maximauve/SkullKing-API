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
                await this.createAllUsers()
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
                });
            });
        });
    }
}
