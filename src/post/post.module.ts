import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { UserModule } from '@/user/user.module';
import { FileModule } from '@/file/file.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    UserModule,
    FileModule
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule { }
