import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Model } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { UserService } from '@/user/user.service';
import { FileService } from '@/file/file.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private userService: UserService,
    private fileService: FileService,
    private eventEmitter: EventEmitter2,
  ) {}

  isFileExist = async (id: string) => {
    return await this.fileService.isFileExist(id);
  };

  async create(createPostDto: CreatePostDto): Promise<PostDocument> {
    try {
      const { userId, content, urlImg, urlVideo } = createPostDto;

      const user = await this.userService.findById(userId);

      if (!user) throw new NotFoundException('Not found user!');

      const isExistImg = await this.isFileExist(urlImg);

      if (!isExistImg) throw new NotFoundException('Img not exist!');

      const isExistVideo = await this.isFileExist(urlImg);

      if (!isExistVideo) throw new NotFoundException('Video not exist!');

      const post = await this.postModel.create({
        userPost: user._id,
        content,
        urlImg,
        urlVideo,
      });

      // emit event khi tạo post
      this.eventEmitter.emit('post.created', {
        postId: post._id,
        urlImg,
        urlVideo,
      });

      return post;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException(err.message);
    }
  }
}
