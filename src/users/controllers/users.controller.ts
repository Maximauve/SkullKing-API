import { Body, Controller, Post, Get, Logger, Param } from '@nestjs/common';
import { CreatedUsersDto } from '../dto/users.dto';
import { UsersService } from '../services/users.service';
import { HttpException, UnauthorizedException } from '@nestjs/common/exceptions';
import { ValidationPipe } from '@nestjs/common/pipes';
import { Req, UseGuards, UsePipes } from '@nestjs/common/decorators';
import { AuthService } from '../../auth/services/auth.service';
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { LoginDto } from '../dto/login.dto';


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
  SignUp(@Body() body: CreatedUsersDto): {} {
    if (this.usersService.checkUnknownUser(body)) {
      throw new HttpException('User already exists', 409);
    }
    return this.usersService.Create(body);
  }

  @Post('/auth/login')
  async Login(@Body() body: LoginDto) {
    let user = await this.usersService.FindOneEmail(body.email);
    if (!user || user.password !== body.password) {
      throw new UnauthorizedException();
    }
    return this.authService.Login(user);
  }
}