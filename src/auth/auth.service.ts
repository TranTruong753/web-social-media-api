import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePasswordHelper, hashPasswordHelper } from 'src/common/utils/utils';
import { UserService } from 'src/user/user.service';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/schemas/user.schema';
import { Model } from 'mongoose';
import { RegisterDto } from './dto/register.dto';


@Injectable()
export class AuthService {

    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) { }

    generateJwt(payload) {
        return this.jwtService.sign(payload);
    }


    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userService.findByEmail(email);
        if (!user) return null;

        const isValidPassword = await comparePasswordHelper(pass, user.password);
        if (!isValidPassword) return null;
        return user;
    }


    async signInGoogle(user) {
        if (!user) {
            throw new BadRequestException('Unauthenticated');
        }

        const userExists = await this.userService.findByEmail(user.email);

        if (!userExists) {
            return this.registerGoogleUser(user);
        }

        if(userExists.isActive === false){
            return this.userService.sendCodeId(userExists)
        }

        const payload = {
            id: userExists._id,
            email: userExists.email,
            username: userExists.username,
        };

        return {
            message: 'Đăng nhập thành công!',
            user: {
                id: userExists._id,
                email: userExists.email,
                username: userExists.username
            },
            access_token: this.generateJwt(payload),
        };
    }


    async signIn(user: any) {
        const payload = {
            id: user._id,
            email: user.email,
            username: user.username
        };
        return {
            user: {
                id: user._id,
                email: user.email,
                username: user.username
            },
            access_token: this.generateJwt(payload),
        };

    }


    async registerGoogleUser(user) {
       return this.userService.handleRegister(user)
    }

    async registerUser(user: RegisterDto) {

        return this.userService.handleRegister(user)

    }

}


