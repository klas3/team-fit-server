import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import UserModule from '../user/user.module';
import AuthService from './auth.service';
import JwtStrategy from './jwt.strategy';
import AuthController from './auth.controller';
import EmailModule from '../email/email.module';
import PartyModule from '../party/party.module';

dotenv.config();

@Module({
  imports: [
    UserModule,
    PassportModule,
    EmailModule,
    PartyModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
class AuthModule {}

export default AuthModule;
