import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import PartyController from './party.controller';
import PartyService from './party.service';
import Waypoint from '../entity/Waypoint';
import UserModule from '../user/user.module';
import Party from '../entity/Party';
import WaypointService from './waypoint.service';
import PartyGateway from './party.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Waypoint, Party]), UserModule],
  providers: [PartyService, WaypointService, PartyGateway],
  controllers: [PartyController],
  exports: [PartyService, WaypointService],
})
class PartyModule {}

export default PartyModule;
