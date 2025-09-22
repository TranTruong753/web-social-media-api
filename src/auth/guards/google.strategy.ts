import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:8080/api/v1/auth/google/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, name, emails, photos } = profile;

    const fullName = [name?.givenName, name?.middleName, name?.familyName]
      .filter(Boolean) // loại bỏ undefined / null / ''
      .join(' ');

    const user = {
      provider: 'google',
      providerId: id,
      email: emails?.[0]?.value,
      username: fullName,
      picture: photos?.[0]?.value,
    };

    done(null, user);
  }
}
