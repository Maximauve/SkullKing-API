import {CreatedUserDto} from "./users.dto";
import {PartialType} from "@nestjs/swagger";

export class UpdatedUsersDto extends PartialType(CreatedUserDto) {}