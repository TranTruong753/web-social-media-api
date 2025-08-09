import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePasswordHelper, hashPasswordHelper } from 'src/common/utils/utils';
import { UserService } from 'src/user/user.service';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/schemas/user.schema';
import { Model } from 'mongoose';


@Injectable()
export class AuthService {

    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        @InjectModel(User.name) private userModel: Model<User>
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

        const payload = {
            id: userExists._id,
            email: userExists.email,
            username: userExists.username,
        };

        return {
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
        try {
            const { username, email } = user

            //hash password
            const hashPassword = await hashPasswordHelper('123456');

            const createdUser = await this.userModel.create({ username, email, password: hashPassword })

           
            const payload = {
                id: createdUser._id,
                email: createdUser.email,
                username: createdUser.username
            };


            return {
                user: {
                    id: createdUser._id,
                    email: createdUser.email,
                    username: createdUser.username
                },
                access_token: this.generateJwt(payload),
            };
        } catch {
            throw new InternalServerErrorException();
        }
    }

}


