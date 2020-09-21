import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import PartyController from './party.controller';
import User from '../entity/User';
import PartyService from './party.service';
import Waypoint from '../entity/Waypoint';
import UserModule from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Waypoint]), UserModule],
  providers: [PartyService],
  controllers: [PartyController],
  exports: [PartyService],
})
class PartyModule {}

export default PartyModule;
