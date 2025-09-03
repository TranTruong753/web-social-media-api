import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePasswordHelper, hashPasswordHelper } from 'src/common/utils/utils';
import { UserService } from 'src/user/user.service';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/schemas/user.schema';
import { Model } from 'mongoose';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService {

    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private readonly configService: ConfigService
    ) { }

    generateJwt(payload) {
        return this.jwtService.sign(payload);
    }

    async generateRefreshToken(payload: any) {
        return this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRED'),
        });
    }


    async validateUser(email: string, pass: string): Promise < any > {
            const user = await this.userService.findByEmail(email);
            if(!user) return null;

            const isValidPassword = await comparePasswordHelper(pass, user.password);
            if(!isValidPassword) return null;
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

            const access_token = this.generateJwt(payload)

            res.cookie('access_token', access_token, {
                httpOnly: true,   // chặn JS truy cập
                secure: true,     // chỉ gửi qua HTTPS
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, // 1h
            });


            return {
                message: 'Đăng nhập thành công!',
                user: {
                    id: userExists._id,
                    email: userExists.email,
                    username: userExists.username
                },
                access_token,
            };
        }


    async signIn(req: any, res: any) {

            const user = req.user

            const payload = {
                id: user._id,
                email: user.email,
                username: user.username
            };

            const access_token = this.generateJwt(payload)

            res.cookie('access_token', access_token, {
                httpOnly: true,  // JS không đọc được
                secure: true,    // bật khi chạy HTTPS
                sameSite: 'strict', // chống CSRF
                maxAge: 15 * 60 * 1000, // 15 phút
            });
            return {
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username
                },
                access_token,
            };

        }


    async registerGoogleUser(user, res) {
            const newUser = await this.userService.handleRegisterWithGmail(user)

            const payload = {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
            };

            const access_token = this.generateJwt(payload)

            res.cookie('access_token', access_token, {
                httpOnly: true,   // chặn JS truy cập
                secure: true,     // chỉ gửi qua HTTPS
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, // 1h
            });


            return {
                message: 'Đăng nhập thành công!',
                user: {
                    id: newUser._id,
                    email: newUser.email,
                    username: newUser.username
                },
                access_token,
            };

        }

    async registerUser(user: RegisterDto) {

            return this.userService.handleRegister(user)

        }

    async forgetPassword(email) {
            return this.userService.forgetPassword(email)
        }

    }


