import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Request,
  Body,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { ApiBody, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Public, ResponseMessage } from './decorators/public.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import {
  AuthenticatedRequest,
  CodeAuthDto,
  RegisterDto,
} from './dto/register.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ForgotPasswordDto } from './dto/forget-password.dto';
import { Response } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Public()
  @ApiBody({ type: SignInDto })
  @ResponseMessage('Fetch login')
  async signIn(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signIn(req, res);
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  @Public()
  @ApiBody({ type: RegisterDto })
  @ResponseMessage('Fetch register')
  async register(@Body() user: RegisterDto) {
    return this.authService.registerUser(user);
  }

  @Post('check-code')
  @Public()
  checkCode(@Body() data: CodeAuthDto) {
    return this.authService.activateUser(data);
  }

  @Post('resend-code')
  @Public()
  resendCode(@Body() data: CodeAuthDto) {
    return this.authService.resendCodeId(data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }

  @Get('google')
  @Public()
  @UseGuards(GoogleOauthGuard)
  async auth() {}

  @Get('google/redirect')
  @Public()
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(
    @Request() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    return this.authService.signInGoogle(req.user, res);
  }

  @Get('test-send-mail')
  @Public()
  testMail() {
    this.mailerService.sendMail({
      to: 'truongtq753@gmail.com', // list of receivers
      subject: 'Testing Nest MailerModule ✔', // Subject line
      text: 'welcome', // plaintext body
      template: 'register',
      context: {
        name: 'TQT',
        activationCode: 123456789,
      },
    });
    return 'ok';
  }

  @Post('forget-password')
  @Public()
  forgetPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgetPassword(body.email);
  }

  @Post('logout')
  @Public()
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return { message: 'Đăng xuất thành công!' };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user; // có từ JwtRefreshStrategy.validate()

    return this.authService.resetRefreshToken(user, res);
  }
}
