import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          // refresh token lấy từ cookie hoặc body
          if (req.cookies?.['refresh_token']) {
            return req.cookies['refresh_token'];
          }
          if (req.body?.refreshToken) {
            return req.body.refreshToken;
          }
          return null;
        },
      ]),
      secretOrKey: configService.get<string>('JWT_REFRESH_TOKEN_SECRET') || '',
      passReqToCallback: true, // cho phép lấy req trong validate()
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken =
      req.cookies?.['refresh_token'] || req.body?.refreshToken;
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');

    const user = await this.userService.findById(payload.id);
    if (!user || !user.tokenHash) throw new UnauthorizedException();

    // so sánh token client gửi với hash trong user
    const isValid = await bcrypt.compare(refreshToken, user.tokenHash);
    if (!isValid) throw new UnauthorizedException('Refresh token not valid');

    return user; // gán vào req.user
  }
}
