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
    cardType!: {
        name: string,
        superior_to: [],
        circular_winner: boolean,
    }
    cardTypeId!: string;
    allIds: any;

    constructor(app: INestApplication, pathName: string, allIds: any) {
        this.pathName = pathName;
        this.app = app;
        this.allIds = allIds;
    }

    routeTest() {
        throw new Error('Not implemented');
    }

    async createAllUsers(email: string, allIds: any) {
        await Promise.all([this.createAdmin(allIds), this.createUser(allIds), this.createUserWithEmail(email, allIds)])
    }

    public async createAdmin(allIds: any) {
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
        allIds.userIds = [...allIds.userIds, this.adminId]
    }

    public async createDeleteAdmin() {
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
        this.adminId = this.adminUser.id;
        await this.setAdminAccessToken();
    }

    public async deleteAdmin() {
        await this.customDeletePrivate(`users/${this.adminId}`).expectStatus(200)
    }

    public async createUser(allIds: any) {
        this.user = {
            email: faker.internet.email(),
            password: faker.internet.password(10),
        }
        this.userId = await this.customPostPrivate('users/auth/sign-up')
            .withJson({
                ...this.user,
                username: faker.internet.userName(),
            }).expectStatus(201).returns('id')
        allIds.userIds = [...allIds.userIds, this.userId]
    }

    public async createUserWithEmail(email: string, allIds: any) {
        this.commonUser = {
            email: email,
            password: faker.internet.password(10),
        }
        this.commonUserId = await this.customPostPrivate('users/auth/sign-up')
          .withJson({
              ...this.commonUser,
              username: faker.internet.userName(),
          }).expectStatus(201).returns('id')
        allIds.userIds = [...allIds.userIds, this.commonUserId]
    }

    public async createCardType(allIds: any) {
        this.cardType = {
            name: faker.lorem.word(),
            superior_to: [],
            circular_winner: false,
        }
        this.cardTypeId = await this.customPostCard('cards-types')
            .withJson(this.cardType)
            .expectStatus(201)
            .returns('id')
        allIds.cardTypeIds = [...allIds.cardTypeIds, this.cardTypeId]
        return allIds;
    }

    public async deleteAll(allIds: any) {
        await this.createDeleteAdmin();
        for (const id of allIds.userIds) {
            await this.customDeletePrivate(`users/${id}`)
        }
        for (const id of allIds.cardIds) {
            await this.customDeletePrivate(`cards/${id}`)
        }
        for (const id of allIds.cardTypeIds) {
            await this.customDeletePrivate(`cards-types/${id}`)
        }
        for (const id of allIds.pirateGlosseryIds) {
            await this.customDeletePrivate(`pirate-glossary/${id}`)
        }
        this.allIds = {
            userIds: [],
            cardTypeIds: [],
            cardIds: [],
            pirateGlosseryIds: [],
        };
        await this.deleteAdmin();
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

    protected customPostPrivate(path: string) {
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

    protected customPost(path: string) {
        return pactum
          .spec()
          .post(`/${this.pathName}/${path}`)
          .withHeaders('Authorization', `Bearer ${this.accessToken}`);
    }

    protected customPostCard(path: string) {
        return pactum
          .spec()
          .post(`/${path}`)
          .withHeaders('Authorization', `Bearer ${this.accessToken}`);
    }

    protected customDeletePrivate(path: string) {
        return pactum
          .spec()
          .delete(`/${path}`)
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
