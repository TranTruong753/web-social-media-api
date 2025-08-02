import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";
import { IsOptional } from "class-validator";

export class SearchUserDto {

    @ApiProperty({ required: false, description: 'Họ và tên', example: 'Nguyễn Văn A' })
    @IsOptional()
    readonly username: string

    @ApiProperty({ required: false, description: 'Email người dùng', example: 'abc@gmail.com' })
    @IsOptional()
    readonly email: string

}