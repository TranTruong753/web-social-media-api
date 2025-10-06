import { Body, Controller, Post} from '@nestjs/common';
import { PostService } from './post.service';
import { ApiBody, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CreatePostDto } from './dto/create-post.dto';
import { Public } from '@/auth/decorators/public.decorator';

@ApiTags('Post')
@ApiCookieAuth()
@Controller('post')
export class PostController {
    constructor(
        private readonly postService: PostService
    ) { }

    @Post('create-post')
    @Public()
    @ApiBody({ type: CreatePostDto })
    async post(@Body() dto: CreatePostDto,) {

        return await this.postService.create(dto)
    }


}
