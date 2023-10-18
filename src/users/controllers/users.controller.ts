import { Body, Controller, Post, Get } from '@nestjs/common';
import {CreatedUserDto} from '../dto/users.dto';
import { UsersService } from '../services/users.service';
import { HttpException, UnauthorizedException } from '@nestjs/common/exceptions';
import { ValidationPipe } from '@nestjs/common/pipes';
import { UseGuards, UsePipes } from '@nestjs/common/decorators';
import { AuthService } from '../../auth/services/auth.service';
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { LoginDto } from '../dto/login.dto';
const bcrypt = require('bcrypt');


@Controller('users')
export class UsersController {

  constructor(private usersService: UsersService, private authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  GetAll(): {} {
    return this.usersService.GetAll();
  }

  @UsePipes(ValidationPipe)
  @Post('/auth/sign-up')
  async SignUp(@Body() body: CreatedUserDto): Promise<{}> {
    if (await this.usersService.checkUnknownUser(body)) {
      throw new HttpException('User already exists', 409);
    }
    body.password = await hashPassword(body.password);
    return this.usersService.Create(body);
  }

  @Post('/auth/login')
  async Login(@Body() body: LoginDto) {
    let user = await this.usersService.FindOneEmail(body.email);
    if (!user || await comparePassword(body.password, user.password)) {
      throw new UnauthorizedException();
    }
    return this.authService.Login(user);
  }

}
async function hashPassword(plaintextPassword: string) {
  const hash: string = await bcrypt.hash(plaintextPassword, 10);
  return hash
}

// compare password
async function comparePassword(plaintextPassword: string, hash: string) {
  const result = await bcrypt.compare(plaintextPassword, hash);
  return result;
}
