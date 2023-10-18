import {Body, Controller, Delete, Get, Param, Post, Put, Req} from '@nestjs/common';
import {CreatedUserDto} from '../dto/users.dto';
import {UsersService} from '../services/users.service';
import {HttpException} from '@nestjs/common/exceptions';
import {ValidationPipe} from '@nestjs/common/pipes';
import {UseGuards, UsePipes} from '@nestjs/common/decorators';
import {AuthService} from '../../auth/services/auth.service';
import {JwtAuthGuard} from "../../auth/guards/jwt-auth.guard";
import {LoginDto} from '../dto/login.dto';
import {Role} from '../role.enum';
import {UpdatedUsersDto} from '../dto/usersUpdate.dto';

const bcrypt = require('bcrypt');


@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService, private authService: AuthService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    GetAll(): {} {
        return this.usersService.GetAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('/me')
    GetMe(@Req() req): {} {
        return this.usersService.FindOneId(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    GetId(@Param() id: string): {} {
        return this.usersService.FindOneId(id);
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
        if (!user) {
            throw new HttpException('User not found', 404);
        } else if (!await comparePassword(body.password, user.password)) {
            throw new HttpException('Password incorrect', 401);
        }
        return this.authService.Login(user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/:id')
    async Delete(@Param('id') id: string, @Req() req): Promise<{}> {
        const me = await this.usersService.FindOneId(req.user.id);
        if (Role.Admin != me.role) {
            throw new HttpException('Forbidden', 403);
        }
        return this.usersService.Delete(id);
    }

    @UseGuards(JwtAuthGuard)
    @UsePipes(ValidationPipe)
    @Put('/:id')
    async Update(@Param('id') id: string, @Req() req, @Body() body: UpdatedUsersDto): Promise<{}> {
        const me = await this.usersService.FindOneId(req.user.id);
        if (Role.Admin != me.role && me.id != id) {
            throw new HttpException('Forbidden', 403);
        } else if (await this.usersService.checkUnknownUser(body)) {
            throw new HttpException('User already exists', 409);
        }
        if (body.password) body.password = await hashPassword(body.password);
        return this.usersService.Update(id, body);
    }
}

async function hashPassword(plaintextPassword: string) {
    return await bcrypt.hash(plaintextPassword, 10)
}

// compare password
async function comparePassword(plaintextPassword: string, hash: string) {
    return await bcrypt.compare(plaintextPassword, hash);
}
