import {Body, Controller, Delete, Get, Param, Post, Put, Req, UnauthorizedException} from '@nestjs/common';
import {RedisService} from "../service/redis.service";
import {UserRedisDto} from "../dto/users.redis.dto";
import {UseGuards} from "@nestjs/common/decorators";
import {JwtAuthGuard} from "../../auth/guards/jwt-auth.guard";



@Controller('redis')
export class RedisController {

  constructor(private readonly redisService: RedisService) {}

  @Post("")
  async Set(@Body() user: UserRedisDto): Promise<string> {
    await this.redisService.set(user.name, JSON.stringify(user));
    return "Utilisateur créé avec succès";
  }

  @Get("/:name")
  async Get(@Param('name') name: string): Promise<{}> {
    return this.redisService.get(name);
  }
}
