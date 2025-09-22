import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { extname, join } from 'path';
import { promises as fs } from 'fs';
import { UpdateUserDto } from './dto/update-user.dto';
import { cleanObject } from 'src/common/utils';
import { SearchUserDto } from './dto/search-user.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { Gender } from 'src/common/enums';

@ApiTags('User')
// @ApiBearerAuth()
@ApiCookieAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('create-user')
  @Public()
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
      limits: { fieldSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'Nguyễn Văn A' },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', format: 'password' },
        bio: { type: 'string' },
        birthDate: { type: 'string', format: 'date' },
        phone: { type: 'string' },
        avatar: {
          type: 'string',
          format: 'binary',
        },
        gender: {
          type: 'string',
          enum: Object.values(Gender),
        },
      },
      required: ['username', 'email', 'password'],
    },
  })
  async create(
    @Body() dto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatarPath = file ? file.filename : null;

    try {
      const cleanedData = cleanObject(dto);

      const user = await this.userService.create(cleanedData as CreateUserDto);

      return {
        message: 'Tạo người dùng thành công!',
        data: user,
      };
    } catch (error) {
      if (avatarPath) {
        const fullPath = join(process.cwd(), 'uploads/avatars', avatarPath);
        try {
          await fs.unlink(fullPath);
          console.warn(`Đã xóa ảnh vì tạo user thất bại: ${avatarPath}`);
        } catch (fsErr) {
          console.error('Xóa ảnh thất bại:', fsErr);
        }
      }
      throw error;
    }
  }

  @Patch('update-user/:id')
  @Public()
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
      limits: { fieldSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'Nguyễn Văn A' },
        password: { type: 'string', format: 'password' },
        bio: { type: 'string' },
        birthDate: { type: 'string', format: 'date' },
        phone: { type: 'string' },
        avatar: {
          type: 'string',
          format: 'binary',
        },
        isDeleted: { type: 'boolean' },
        isActive: { type: 'boolean' },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatarPath = file ? file.filename : null;

    try {
      const user = await this.userService.update(id, {
        ...dto,
        avatar: avatarPath,
      });

      return {
        message: 'Cập nhật người dùng thành công!',
        data: user,
      };
    } catch (error) {
      if (avatarPath) {
        const fullPath = join(process.cwd(), 'uploads/avatars', avatarPath);
        try {
          await fs.unlink(fullPath);
          console.warn(`Đã xóa ảnh vì tạo user thất bại: ${avatarPath}`);
        } catch (fsErr) {
          console.error('Xóa ảnh thất bại:', fsErr);
        }
      }
      throw error;
    }
  }

  @Public()
  @Get('get-all-user')
  async findAll() {
    return this.userService.findAll();
  }

  @Get('get-user-by-name/:username')
  async findByUsername(@Param('username') username: string) {
    return this.userService.findByUsername(username);
  }

  @Get('get-user-by-id/:id')
  async findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get('search')
  async search(@Query() query: SearchUserDto) {
    return this.userService.findAllByQuery(query);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
