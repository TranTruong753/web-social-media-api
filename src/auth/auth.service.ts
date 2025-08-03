import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePasswordHelper } from 'src/common/utils/utils';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {

    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userService.findByEmail(email);
        if (!user) return null;

        const isValidPassword = await comparePasswordHelper(pass, user.password);
        if (!isValidPassword) return null;
        return user;
    }

    async signIn(user: any) {
        const payload = { username: user.email, sub: user._id };
        return {
            user: {
                email: user.email,
                _id: user._id,
                name: user.name
            },
            access_token: this.jwtService.sign(payload),
        };

    }
}
