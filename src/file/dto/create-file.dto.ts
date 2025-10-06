import { TypeFile } from '@/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class CreateFileDto {
  @ApiProperty({
    description: 'content',
    example: '...v.v',
  })
  readonly name: string;

  @ApiProperty({
    description: 'path',
    example: 'img/...',
  })
  readonly path: string;

  @ApiProperty({
    description: 'type',
    example: 'video or img',
  })
  @IsEnum(TypeFile, { message: 'Type must be video or img' })
  readonly type: TypeFile;
}
