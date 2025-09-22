// update-user.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    required: false,
    description: 'Mật khẩu người dùng',
    example: 'VanA@123',
  })
  readonly password: string;

  @ApiProperty({ required: false, description: 'Người dùng đang hoạt động' })
  @IsOptional()
  readonly isActive?: boolean;

  @ApiProperty({ required: false, description: 'Người dùng đã bị xóa' })
  @IsOptional()
  readonly isDeleted?: boolean;

  @ApiProperty({ required: false, description: 'CodeID' })
  @IsOptional()
  readonly codeId?: string;

  @ApiProperty({ required: false, description: 'Thời gian codeID' })
  @IsOptional()
  readonly codeExpired?: Date;
}
