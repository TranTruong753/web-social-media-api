import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    required: false,
    description: 'userId',
    example: 'Id',
  })
  @IsOptional()
  readonly userId: string;

  @ApiProperty({
    description: 'content',
    example: '...v.v',
  })
  @IsString()
  readonly content: string;

  @ApiProperty({ description: 'ObjectId của File', required: false })
  @IsOptional()
  @IsMongoId()
  readonly urlImg: string;

  @ApiProperty({ description: 'ObjectId của File', required: false })
  @IsOptional()
  @IsMongoId()
  readonly urlVideo: string;
}
