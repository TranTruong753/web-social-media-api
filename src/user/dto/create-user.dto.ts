// dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, IsString, MinLength, IsOptional, IsDateString, Matches } from 'class-validator';

export class CreateUserDto {

  @ApiProperty({description: 'Họ và tên', example: 'Nguyễn Văn A'})
  @IsString()
  readonly username: string

  @ApiProperty({description: 'Email người dùng', example: 'abc@gmail.com'})
  @IsEmail()
  readonly email: string

  @ApiProperty({description: 'Mật khẩu người dùng', example:'VanA@123'})
  @IsString()
  @IsNotEmpty({message: 'Mật khẩu không được để trống!'})
  readonly password: string

  @ApiProperty({description: 'Tiểu sử người dùng', example: '18 tuổi nhiệt quyết'})
  @IsOptional()
  readonly bio: string

  @ApiProperty({description: 'Ngày sinh người dùng', example: '2003-05-19'})
  @IsOptional()
  @IsDateString({},{ message: 'Ngày sinh phải đúng định dạng ISO (yyyy-mm-dd).' })
  readonly birthDate: string

  @ApiProperty({description: 'Số điện thoại người dùng', example: '0123456789'})
  @IsOptional()
  @Matches(/^0\d{9}$/, { message: 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.' })
  readonly phone: string


}
