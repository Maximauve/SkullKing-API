import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users.entity';
import { CreatedUsersDto } from '../dto/users.dto';
import { HttpException } from '@nestjs/common/exceptions';
import {UpdatedUsersDto} from "../dto/usersUpdate.dto";

@Injectable()
export class UsersService {
    constructor(
      @InjectRepository(User)
      private usersRepository: Repository<User>,
    ) {}

    async GetAll(): Promise<User[]> {
        return await this.usersRepository.find();
    }

    async GetMe(): Promise<User> {
      return await this.usersRepository
        .createQueryBuilder("users")
        .where("users.id= :id", {id: '1'})
        .getOne()
    }

    async FindOneId(id: string): Promise<User> {
        return await this.usersRepository
          .createQueryBuilder("users")
          .where("users.id= :id", {id: id})
          .getOne()
    }

    async FindOneUsername(username: string): Promise<User> {
        return await this.usersRepository
          .createQueryBuilder("users")
          .where("users.username= :username", {username: username})
          .getOne()
    }

    async FindOneEmail(email: string): Promise<User> {
      return await this.usersRepository
        .createQueryBuilder("users")
        .where("users.email= :email", {email: email})
        .getOne()
    }

  async checkUnknownUser(user: CreatedUsersDto | UpdatedUsersDto): Promise<boolean> {
    let unknownUser = await this.usersRepository
      .createQueryBuilder("users")
      .where("users.username= :username", {username: user.username})
      .orWhere("users.email= :email", {email: user.email})
      .getOne()
    if (unknownUser == null) return false;
    return true;
  }
  async Create(user: CreatedUsersDto): Promise<User> {
      const newUser = this.usersRepository.create(user);
      return this.usersRepository.save(newUser);
  }

  async Delete(userId: string) {
    let query = await this.usersRepository
      .createQueryBuilder()
      .delete()
      .from(User)
      .where("id= :id", { id: userId })
      .execute();
    if (query.affected == 0) throw new HttpException("User not found",  404);
    return {};
  }

  async Update(userId: string, user: UpdatedUsersDto) {
    let query = await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set(user)
      .where("id= :id", { id: userId })
      .execute();
    if (query.affected == 0) throw new HttpException("User not found",  404);
    return {};
  }
}
