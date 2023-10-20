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
    commonUser!: {
        email: string,
        password: string,
    }
    commonUserId!: string;

    constructor(app: INestApplication, pathName: string) {
        this.pathName = pathName;
        this.app = app
    }

    routeTest() {
        throw new Error('Not implemented');
    }

    async createAllUsers(email: string) {
        await Promise.all([this.createAdmin(), this.createUser(), this.createUserWithEmail(email)])
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

    public async createUserWithEmail(email: string) {
        this.commonUser = {
            email: email,
            password: faker.internet.password(10),
        }
        this.commonUserId = await this.customPostPrivate('users/auth/sign-up')
            .withJson({
                ...this.commonUser,
                username: faker.internet.userName(),
            }).expectStatus(201).returns('id')
    }

    protected async getAccessToken() {
        return this.customPostPrivate('users/auth/login')
          .withJson(this.user)
          .expectStatus(201)
          .returns('access_token') as unknown as string;
    }

    protected async setAccessToken() {
        this.accessToken = await this.getAccessToken();
    }

    protected async setAdminAccessToken() {
        this.accessToken = await this.getAdminAccessToken();
    }

    protected async getAdminAccessToken() {
        return this.customPostPrivate('users/auth/login')
          .withJson(this.admin)
          .expectStatus(201)
          .returns('access_token') as unknown as string;
    }

    private customPostPrivate(path: string) {
        return pactum.spec().post(`/${path}`);
    }

    protected customPostWithoutAccessToken(path: string) {
        return pactum.spec().post(`/${this.pathName}/${path}`);
    }

    protected customGetWithoutAccessToken(path: string) {
        return pactum.spec().get(`/${this.pathName}/${path}`);
    }

    protected customPutWithoutAccessToken(path: string) {
        return pactum.spec().put(`/${this.pathName}/${path}`);
    }

    protected itu(name: string, fn: () => Promise<unknown>) {
        it(name, async () => {
            await this.setAccessToken();
            await fn();
        });
    }

    protected customGet(path: string) {
        return pactum
          .spec()
          .get(`/${this.pathName}/${path}`)
          .withHeaders('Authorization', `Bearer ${this.accessToken}`);
    }

    protected customPut(path: string) {
        return pactum
          .spec()
          .put(`/${this.pathName}/${path}`)
          .withHeaders('Authorization', `Bearer ${this.accessToken}`);
    }

    protected customDelete(path: string) {
        return pactum
          .spec()
          .delete(`/${this.pathName}/${path}`)
          .withHeaders('Authorization', `Bearer ${this.accessToken}`);
    }

    protected find() {
        return pactum
          .spec()
          .get(`/${this.pathName}`)
          .withHeaders('Authorization', `Bearer ${this.accessToken}`);
    }

    protected findById(id: string) {
        return pactum
          .spec()
          .get(`/${this.pathName}/{id}`)
          .withPathParams('id', id)
          .withHeaders('Authorization', `Bearer ${this.accessToken}`);
    }
}
