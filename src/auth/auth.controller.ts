import { Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Public, ResponseMessage } from './decorators/public.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleOauthGuard } from './guards/google-oauth.guard';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @Public()
    @ApiBody({ type: SignInDto })
    @ResponseMessage("Fetch login")
    async signIn(@Request() req) {
        return this.authService.signIn(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @Get('google')
    @Public()
    @UseGuards(GoogleOauthGuard)
    async auth() { }

    @Get('google/redirect')
    @Public()
    @UseGuards(GoogleOauthGuard)
    async googleAuthRedirect(@Request() req) {

       return this.authService.signInGoogle(req.user);
    }


}
