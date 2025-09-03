import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
    @ApiProperty({ description: 'Email người dùng', example: 'abc@gmail.com' })
    @IsEmail({}, { message: 'Email không hợp lệ!' })
    email: string;
}
