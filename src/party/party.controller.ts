// prettier-ignore
import {
  BadRequestException,
  Body, Controller, ForbiddenException, Get, NotFoundException, Post,
} from '@nestjs/common';
import { Authorize, GetUser } from '../auth/auth.decorators';
import Party from '../entity/Party';
import Waypoint from '../entity/Waypoint';
import UserService from '../user/user.service';
import User from '../entity/User';
import PartyService from './party.service';
import WaypointService from './waypoint.service';
import PartyGateway from './party.gateway';

@Authorize()
@Controller('party')
class PartyController {
  private readonly maxPartyMembersCount = 10;

  constructor(
    private readonly waypointService: WaypointService,
    private readonly partyService: PartyService,
    private readonly userService: UserService,
    private readonly partyGateway: PartyGateway,
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
    this.partyGateway.leaveParty(oldParty.id, user.id);
    this.partyGateway.emitUserLeave(oldParty.id, user.id);
    if (oldParty.users.length === 1) {
      await this.waypointService.deleteByPartyId(oldParty.id);
      await this.partyService.delete(oldParty.id);
    }
    this.partyGateway.joinParty(partyId, user.id);
    this.partyGateway.emitUserJoin(partyId, partyUser);
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
    const newParty = await this.partyService.create(user);
    this.partyGateway.leaveParty(user.partyId, user.id);
    this.partyGateway.emitUserLeave(user.partyId, user.id);
    this.partyGateway.joinParty(newParty.id, user.id);
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
    if (!partyId) {
      throw new BadRequestException('Party id is not specified');
    }
    const party = await this.partyService.getOnlyById(partyId);
    if (!party) {
      throw new NotFoundException('Party is not found');
    }
    await this.waypointService.deleteByPartyId(partyId);
    // prettier-ignore
    const partyWaypoints = waypoints.map((partyWaypoint) => {
      const waypoint = { ...partyWaypoint };
      waypoint.partyId = partyId;
      return waypoint;
    });
    // prettier-ignore
    const waypointsForCreate = partyWaypoints.map(
      (waypoint) => this.waypointService.create(waypoint),
    );
    const createdWaypoints = await Promise.all(waypointsForCreate);
    party.startPointLatitude = startPointLatitude;
    party.startPointLongitude = startPointLongitude;
    party.endPointLatitude = endPointLatitude;
    party.endPointLongitude = endPointLongitude;
    await this.partyService.update(party);
    party.waypoints = createdWaypoints;
    this.partyGateway.emitNewRoute(partyId, party);
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
