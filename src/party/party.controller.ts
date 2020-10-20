// prettier-ignore
import {
  Body, Controller, ForbiddenException, Get, NotFoundException, Post,
} from '@nestjs/common';
import { Authorize, GetUser } from '../auth/auth.decorators';
import Party from '../entity/Party';
import Waypoint from '../entity/Waypoint';
import AppGateway from '../gateway/app.gateway';
import UserService from '../user/user.service';
import User from '../entity/User';
import PartyService from './party.service';
import WaypointService from './waypoint.service';

@Authorize()
@Controller('party')
class PartyController {
  private readonly maxPartyMembersCount = 10;

  constructor(
    private readonly waypointService: WaypointService,
    private readonly partyService: PartyService,
    private readonly userService: UserService,
    private readonly appGateway: AppGateway,
  ) {}

  @Get('info')
  public async getInfo(@GetUser() requestUser: User): Promise<Party> {
    const user = await this.userService.getById(requestUser.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    let party = await this.partyService.getById(user.partyId);
    if (!party) {
      party = await this.partyService.create();
      user.partyId = party.id;
      await this.userService.update(user);
    }
    party.users = party.users.map((partyUser) => {
      // prettier-ignore
      const {
        id, login, partyId, currentLatitude, currentLongitude, markerColor,
      } = partyUser;
      const safeUser = new User();
      safeUser.id = id;
      safeUser.login = login;
      safeUser.partyId = partyId;
      safeUser.currentLatitude = currentLatitude;
      safeUser.currentLongitude = currentLongitude;
      safeUser.markerColor = markerColor;
      return safeUser;
    });
    return party;
  }

  @Post('join')
  public async join(@GetUser() user: User, @Body('partyId') partyId: string): Promise<void> {
    const newParty = await this.tryFindParty(partyId);
    if (newParty.users.length === this.maxPartyMembersCount) {
      throw new ForbiddenException('This party if full');
    }
    const partyUser = await this.userService.getById(user.id);
    if (!partyUser) {
      throw new NotFoundException('User is not found');
    }
    if (partyUser.partyId === partyId) {
      throw new ForbiddenException('You are already in this party');
    }
    const oldParty = await this.tryFindParty(partyUser.partyId);
    partyUser.partyId = partyId;
    await this.userService.update(partyUser);
    this.appGateway.leaveParty(partyId, user.id);
    this.appGateway.emitUserLeave(partyId, user.id);
    if (oldParty.users.length === 1) {
      await this.partyService.delete(partyUser.partyId);
    }
    this.appGateway.joinParty(partyId, user.id);
    this.appGateway.emitUserJoin(partyId, partyUser);
  }

  @Post('leave')
  public async leave(@GetUser() requestUser: User): Promise<void> {
    const user = await this.userService.getById(requestUser.id);
    if (!user) {
      throw new NotFoundException('User is not found');
    }
    const party = await this.tryFindParty(user.partyId);
    if (party.users.length === 1) {
      throw new ForbiddenException('You can not leave this party');
    }
    await this.partyService.create(user);
    this.appGateway.leaveParty(user.partyId, user.id);
    this.appGateway.emitUserLeave(user.partyId, user.id);
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
