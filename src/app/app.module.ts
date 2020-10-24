import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import AuthModule from '../auth/auth.module';
import EmailModule from '../email/email.module';
import PartyModule from '../party/party.module';
import UserModule from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forRoot(), UserModule, PartyModule, EmailModule, AuthModule],
})
class AppModule {}

export default AppModule;
