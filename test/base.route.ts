import { INestApplication } from '@nestjs/common';
import * as pactum from 'pactum';
import { faker } from '@faker-js/faker';

export class BaseRouteTesting {
    app!: INestApplication;
    pathName!: string;
    accessToken!: string;
    admin!: {
        email: string,
        password: string,
    };
    adminUser: { id: string, [k: string]: unknown };
    adminId!: string;
    user!: {
        email: string,
        password: string,
    }
    userId!: string;

    constructor(app: INestApplication, pathName: string) {
        this.pathName = pathName;
        this.app = app
    }

    routeTest() {
        throw new Error('Not implemented');
    }

    async createAllUsers() {
        await Promise.all([this.createAdmin(), this.createUser()])
    }

    private async createAdmin() {
        this.admin = {
            email: faker.internet.email(),
            password: faker.internet.password(10),
        }
        this.adminUser = await this.customPostPrivate('users/auth/sign-up')
            .withJson({
                ...this.admin,
                username: faker.internet.userName(),
                role: 'Admin',
            }).expectStatus(201).returns('res.body')
        this.adminId = this.adminUser.id
    }

    public async createUser() {
        this.user = {
            email: faker.internet.email(),
            password: faker.internet.password(10),
        }
        this.userId = await this.customPostPrivate('users/auth/sign-up')
            .withJson({
                ...this.user,
                username: faker.internet.userName(),
            }).expectStatus(201).returns('id')
    }

    private customPostPrivate(path: string) {
        return pactum.spec().post(`/${path}`);
    }

    protected customPostWithoutAccessToken(path: string) {
        return pactum.spec().post(`/${this.pathName}/${path}`);
    }
}
