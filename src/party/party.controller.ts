// prettier-ignore
import {
  Body, Controller, ForbiddenException, Get, NotFoundException, Post,
} from '@nestjs/common';
import { Authorize, GetUser } from 'src/auth/auth.decorators';
import Party from 'src/entity/Party';
import Waypoint from 'src/entity/Waypoint';
import UserService from 'src/user/user.service';
import User from '../entity/User';
import PartyService from './party.service';
import WaypointService from './waypoint.service';

@Authorize()
@Controller('party')
class PartyController {
  constructor(
    private readonly waypointService: WaypointService,
    private readonly partyService: PartyService,
    private readonly userService: UserService,
  ) {}

  @Post('join')
  public async join(@GetUser() user: User, @Body('partyId') partyId: string): Promise<void> {
    const newParty = await this.tryFindParty(partyId);
    const partyUser = await this.userService.getById(user.id);
    if (!partyUser) {
      throw new NotFoundException();
    }
    const oldParty = await this.tryFindParty(partyUser.partyId);
    if (oldParty.users.length === 1) {
      await this.partyService.delete(partyUser.partyId);
    } else {
      const oldPartyUserIndex = oldParty.users.findIndex(
        (oldPartyUser) => oldPartyUser.id === partyUser.id,
      );
      oldParty.users.slice(oldPartyUserIndex, 1);
      await this.partyService.update(oldParty);
    }
    newParty.users.push(partyUser);
    await this.partyService.update(newParty);
  }

  @Post('leave')
  public async leave(@GetUser() user: User, @Body('partyId') partyId: string): Promise<void> {
    const party = await this.tryFindParty(partyId);
    if (party.users.length === 1) {
      throw new ForbiddenException('You can not delete this party');
    }
    const userPartyIndex = party.users.findIndex((member) => member.id === user.id);
    if (userPartyIndex === -1) {
      throw new NotFoundException('You are not member of this party');
    }
    party.users.splice(userPartyIndex, 1);
    await this.partyService.update(party);
    await this.partyService.create(user);
  }

  @Post('setRoute')
  public async setRoute(
    @Body('partyId') partyId: string,
    @Body('startPointLatitude') startPointLatitude: number,
    @Body('startPointLongitude') startPointLongitude: number,
    @Body('endPointLatitude') endPointLatitude: number,
    @Body('endPointLongitude') endPointLongitude: number,
    @Body('waypoints') waypoints: Waypoint[],
  ): Promise<void> {
    const party = await this.partyService.getById(partyId);
    if (!party) {
      throw new NotFoundException('This party does not exist');
    }
    await this.waypointService.deleteByPartyId(partyId);
    // prettier-ignore
    const createdWaypoints = waypoints.map((waypoint) => this.waypointService.create(waypoint));
    await Promise.all(createdWaypoints);
    party.startPointLatitude = startPointLatitude;
    party.startPointLongitude = startPointLongitude;
    party.endPointLatitude = endPointLatitude;
    party.endPointLongitude = endPointLongitude;
    party.waypoints = waypoints;
    await this.partyService.update(party);
  }

  private async tryFindParty(partyId: string): Promise<Party> {
    const party = await this.partyService.getById(partyId);
    if (!party) {
      throw new NotFoundException('Party is not found');
    }
    return party;
  }
}

export default PartyController;
