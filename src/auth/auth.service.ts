import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePasswordHelper, hashPasswordHelper } from 'src/common/utils/utils';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService {

    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private readonly configService: ConfigService
    ) { }

    async generateJwt(payload) {
        return this.jwtService.sign(payload);
    }

    async generateTokens(payload: any) {
        const accessToken = this.jwtService.sign(payload);

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRED'),
        });

        return { accessToken, refreshToken };
    }



    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userService.findByEmail(email);
        if (!user) return null;

        const isValidPassword = await comparePasswordHelper(pass, user.password);
        if (!isValidPassword) return null;
        return user;
    }


    async signInGoogle(user, res: any) {
        if (!user) {
            throw new BadRequestException('Unauthenticated');
        }

        const userExists = await this.userService.findByEmail(user.email);

        if (!userExists) {
            return this.registerGoogleUser(user, res);
        }

        const payload = {
            id: userExists._id,
            email: userExists.email,
            username: userExists.username,
        };

        const { accessToken, refreshToken } = await this.generateTokens(payload);

        await this.userService.updateRefreshToken(userExists.id, refreshToken);

        res.cookie('access_token', accessToken, {
            httpOnly: true,   // chặn JS truy cập
            secure: true,     // chỉ gửi qua HTTPS
            // sameSite: 'strict',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60, // 1h
        });

        // set cookie cho refresh token
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        const redirect = this.configService.get<string>('LINK_REDIRECT')

        return res.redirect(redirect);
    }


    async signIn(req: any, res: any) {

        const user = req.user

        const payload = {
            id: user._id,
            email: user.email,
            username: user.username
        };

        const { accessToken, refreshToken } = await this.generateTokens(payload);

        res.cookie('access_token', accessToken, {
            httpOnly: true,  // JS không đọc được
            secure: true,    // bật khi chạy HTTPS
            sameSite: 'lax', // chống CSRF
            maxAge: 15 * 60 * 1000, // 15 phút
        });

        // set cookie refresh token mới
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
            status: true,
            message: 'Đăng nhập thành công',
        };

    }


    async registerGoogleUser(user, res) {
        const newUser = await this.userService.handleRegisterWithGmail(user)

        const payload = {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
        };

        const { accessToken, refreshToken } = await this.generateTokens(payload);

        await this.userService.updateRefreshToken(newUser.id, refreshToken);

        res.cookie('access_token', accessToken, {
            httpOnly: true,   // chặn JS truy cập
            secure: true,     // chỉ gửi qua HTTPS
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60, // 1h
        });

        // set cookie cho refresh token
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });


        const redirect = this.configService.get<string>('LINK_REDIRECT')
        return res.redirect(redirect);

    }

    async registerUser(user: RegisterDto) {

        return this.userService.handleRegister(user)

    }

    async forgetPassword(email) {
        return this.userService.forgetPassword(email)
    }

    async resetRefreshToken(user, res) {
        const payload = { id: user._id, email: user.email, username: user.username };

        const { accessToken, refreshToken } = await this.generateTokens(payload);

        // lưu refresh token mới vào DB (rotate)
        await this.userService.updateRefreshToken(user._id, refreshToken);

        // set lại cookie mới
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 phút
        });

        // set cookie refresh token mới
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { accessToken };
    }

}


