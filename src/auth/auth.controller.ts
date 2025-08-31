import { Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Public, ResponseMessage } from './decorators/public.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { RegisterDto } from './dto/register.dto';
import { MailerService } from '@nestjs-modules/mailer';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private readonly mailerService: MailerService
    ) { }

    @HttpCode(HttpStatus.OK)
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @Public()
    @ApiBody({ type: SignInDto })
    @ResponseMessage("Fetch login")
    async signIn(@Request() req) {
        return this.authService.signIn(req.user);
    }

    @HttpCode(HttpStatus.OK)
    @Post('register')
    @Public()
    @ApiBody({ type: RegisterDto })
    @ResponseMessage("Fetch register")
    async register(@Body() user: RegisterDto) {
        return this.authService.registerUser(user);
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

    @Get('test-send-mail')
    @Public()
    testMail() {
        this.mailerService
            .sendMail({
                to: 'truongtq753@gmail.com', // list of receivers
                subject: 'Testing Nest MailerModule ✔', // Subject line
                text: 'welcome', // plaintext body
                template: "register",
                context: {
                    name: "TQT",
                    activationCode: 123456789
                }

            })
        return "ok";
    }



}
