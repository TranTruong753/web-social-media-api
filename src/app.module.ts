import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from './post/post.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // cho phép sử dụng toàn cục
    }),
    UserModule,
    PostModule,
    MongooseModule.forRoot('mongodb://localhost:27017/social-media'),
    JwtModule.register({
      global: true, // nếu muốn dùng toàn cục
      secret: process.env.JWT_SECRET || 'default-secret', // hoặc lấy từ ConfigService
      signOptions: { expiresIn: '1d' },
    }),

    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],

})
export class AppModule { }
