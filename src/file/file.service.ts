import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFileDto } from './dto/create-file.dto';
import { File } from './schemas/file.schema';
import { TypeFile } from '@/common/enums';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class FileService {
  constructor(@InjectModel(File.name) private fileModel: Model<File>) {}

  async create(createFileDto: CreateFileDto) {
    try {
      const newFile = new this.fileModel(createFileDto);
      return newFile.save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async saveFile(file: Express.Multer.File, type: TypeFile) {
    const createdFile = new this.fileModel({
      name: file.filename, // hoặc file.originalname
      path: file.path.replace(/\\/g, '/'), // normalize cho chắc
      type: type ?? this.detectFileType(file.mimetype),
    });
    return createdFile.save();
  }

  private detectFileType(mimetype: string): TypeFile | null {
    if (mimetype.startsWith('image/')) return TypeFile.Img;
    if (mimetype.startsWith('video/')) return TypeFile.Video;
    return null;
  }

  @OnEvent('post.created')
  async handlePostCreated(payload: {
    postId: string;
    urlImg?: string;
    urlVideo?: string;
  }) {
    if (payload.urlImg) {
      await this.fileModel.updateOne(
        { _id: payload.urlImg },
        { $set: { isOwned: true } },
      );
      console.log(`✅ File ${payload.urlImg} set isOwned = true`);
    }
    if (payload.urlVideo) {
      await this.fileModel.updateOne(
        { _id: payload.urlVideo },
        { $set: { isOwned: true } },
      );
      console.log(`✅ File ${payload.urlImg} set isOwned = true`);
    }
  }

  isFileExist = async (id: string) => {
    const file = await this.fileModel.exists({ _id: id });
    if (file) return true;
    return false;
  };
}
