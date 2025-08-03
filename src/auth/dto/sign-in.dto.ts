import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty } from "class-validator"

export class SignInDto {

      @ApiProperty({ description: 'Email người dùng', example: 'abc@gmail.com' })
      @IsEmail({}, { message: 'Email không hợp lệ!' })
      @IsNotEmpty({ message: 'Email không được để trống!' })
      readonly email: string
    
      @ApiProperty({ required: true, description: 'Mật khẩu người dùng', example: 'VanA@123' })
      @IsNotEmpty({ message: 'Mật khẩu không được để trống!' })
      readonly password: string
}