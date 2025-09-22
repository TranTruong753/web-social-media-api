import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from "class-validator";
import { Gender } from "src/common/enums/gender.enum";


export class RegisterDto {
    @ApiProperty({ required: true, description: 'Họ và tên', example: 'Nguyễn Văn A' })
    @IsString({ message: 'Họ và tên người dùng phải là chuỗi!' })
    @IsNotEmpty({ message: 'Họ và tên người dùng không được để trống!' })
    readonly username: string

    @ApiProperty({ description: 'Email người dùng', example: 'abc@gmail.com' })
    @IsEmail({}, { message: 'Email không hợp lệ!' })
    @IsNotEmpty({ message: 'Email không được để trống!' })
    readonly email: string

    @ApiProperty({ required: true, description: 'Mật khẩu người dùng', example: 'VanA@123' })
    @IsNotEmpty({ message: 'Mật khẩu không được để trống!' })
    readonly password: string

    @ApiProperty({ required: false, description: 'Ngày sinh người dùng', example: '2003-05-19' })
    @IsOptional()
    @IsDateString({}, { message: 'Ngày sinh phải đúng định dạng ISO (yyyy-mm-dd).' })
    readonly birthDate?: string

    @ApiProperty({ required: false, description: 'Số điện thoại người dùng', example: '0123456789' })
    @IsOptional()
    @Matches(/^0\d{9}$/, { message: 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.' })
    readonly phone?: string

    @ApiProperty({ required: false, description: 'Giới tính người dùng', example: 'male or female or other' })
    @IsEnum(Gender, { message: 'Gender must be male, female, or other' })
    readonly gender?: Gender;



}

export class ResendCodeDto {
    @ApiProperty({ required: true, description: 'Id', example: 'Id' })
    @IsNotEmpty({ message: "id không được để trống" })
    id: string;
}
export class CodeAuthDto {
    @ApiProperty({ required: true, description: 'Id', example: 'Id' })
    @IsNotEmpty({ message: "id không được để trống" })
    id: string;


    @ApiProperty({ required: true, description: 'Code Id', example: 'uuid' })
    @IsNotEmpty({ message: 'Code Id không được để trống!' })
    readonly codeId: string
}