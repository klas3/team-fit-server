// prettier-ignore
import {
  BadRequestException,
  Body, Controller, Get, NotFoundException, Post,
} from '@nestjs/common';
import { Authorize, GetUser } from '../auth/auth.decorators';
import MarkerColor from '../entity/MarkerColor';
import Score from '../entity/Score';
import User from '../entity/User';
import ScoreService from './score.service';
import UserService from './user.service';

@Authorize()
@Controller('user')
class UserController {
  constructor(
    private readonly scoreService: ScoreService,
    private readonly userService: UserService,
  ) {}

  @Get('info')
  async getInfo(@GetUser() requestUser: User): Promise<Partial<User>> {
    const user = await this.userService.getById(requestUser.id);
    if (!user) {
      throw new NotFoundException('User is not found');
    }
    // prettier-ignore
    const {
      email, id, login, markerColor, partyId,
    } = user;
    // prettier-ignore
    return {
      id, email, login, markerColor, partyId,
    };
  }

  @Post('setMarkerColor')
  async setMarkerColor(
    @GetUser() requestUser: User,
    @Body('markerColor') markerColor: MarkerColor,
  ): Promise<void> {
    const user = await this.userService.getById(requestUser.id);
    if (!user) {
      throw new NotFoundException('User is not found');
    }
    user.markerColor = markerColor;
    await this.userService.update(user);
  }

  @Get('getScores')
  async getScores(@GetUser() user: User): Promise<Score[]> {
    return this.scoreService.getByUserId(user.id);
  }

  @Post('addScore')
  async addScore(@GetUser() user: User, @Body('mileage') mileage: number): Promise<void> {
    if (!mileage) {
      throw new BadRequestException('Mileage is too small for saving');
    }
    const score = new Score();
    score.userId = user.id;
    score.mileage = mileage;
    score.date = new Date();
    await this.scoreService.create(score);
  }
}

export default UserController;
