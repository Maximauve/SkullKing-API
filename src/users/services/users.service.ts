import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users.entity';
import {CreatedUserDto} from '../dto/users.dto';

@Injectable()
export class UsersService {
    constructor(
      @InjectRepository(User)
      private usersRepository: Repository<User>,
    ) {}

    async GetAll(): Promise<User[]> {
        return await this.usersRepository.find();
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

  async checkUnknownUser(user: CreatedUserDto): Promise<boolean> {
    let unknownUser = await this.usersRepository
      .createQueryBuilder("users")
      .where("users.username= :username", {username: user.username})
      .orWhere("users.email= :email", {email: user.email})
      .getOne()
    if (unknownUser == null) return false;
    return true;
  }
  async Create(user: CreatedUserDto): Promise<User> {
      const newUser = this.usersRepository.create(user);
      return this.usersRepository.save(newUser);
    }
}
