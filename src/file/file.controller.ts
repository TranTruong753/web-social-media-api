import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { TypeFile } from '@/common/enums';
import { Public } from '@/auth/decorators/public.decorator';
import { promises as fs } from 'fs';

@Controller('file')
export class FileController {
    constructor(private readonly fileService: FileService) { }

    @Post('upload-img')
    @Public()
    @UseInterceptors(
        FileInterceptor('img', {
            storage: diskStorage({
                destination: './uploads/img',
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
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/^image\/(jpeg|png|jpg|gif)$/)) {
                    return cb(
                        new BadRequestException('Only image files are allowed!'),
                        false,
                    );
                }
                cb(null, true);
            },
        }),
    )
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                img: {
                    type: 'string',
                    format: 'binary',
                },
            },

        },
    })
    async uploadImg(
        @UploadedFile() file: Express.Multer.File,
    ) {
        const filePath = file ? file.filename : null;
        try {
            const savedFile = await this.fileService.saveFile(file, TypeFile.Img);
            return {
                message: 'Upload success',
                data: savedFile,
            };
        } catch (error) {
            if (filePath) {
                const fullPath = join(process.cwd(), 'uploads/img', filePath);
                try {
                    await fs.unlink(fullPath);
                    console.warn(`Đã xóa ảnh vì upload ảnh thất bại: ${filePath}`);
                } catch (fsErr) {
                    console.error('Xóa ảnh thất bại:', fsErr);
                }
            }
            throw error;
        }

    }

    // ========== Upload video ==========
    @Post('upload-video')
    @Public()
    @UseInterceptors(
        FileInterceptor('video', {
            storage: diskStorage({
                destination: './uploads/video',
                filename: (req, file, cb) => {
                    const uniqueSuffix =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(
                        null,
                        file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
                    );
                },
            }),
            limits: { fileSize: 100 * 1024 * 1024 }, // Giới hạn 50MB
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/^video\/(mp4|avi|mov|mkv)$/)) {
                    return cb(
                        new BadRequestException('Only video files are allowed!'),
                        false,
                    );
                }
                cb(null, true);
            },
        }),
    )
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                video: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    async uploadVideo(@UploadedFile() file: Express.Multer.File) {
        const savedFile = await this.fileService.saveFile(file, TypeFile.Video);
        return {
            message: 'Upload video success',
            data: savedFile,
        };
    }

}
