// prettier-ignore
import {
  BadRequestException,
  Body, Controller, Get, Post,
} from '@nestjs/common';
import { Authorize, GetUser } from 'src/auth/auth.decorators';
import Score from 'src/entity/Score';
import User from 'src/entity/User';
import ScoreService from './score.service';

@Authorize()
@Controller('user')
class UserController {
  constructor(private readonly scoreService: ScoreService) {}

  @Get('info')
  getInfo(@GetUser() user: User): { email: string; login: string } {
    return { email: user.email, login: user.login };
  }

  @Get('getScores')
  getScores(@GetUser() user: User): Promise<Score[]> {
    return this.scoreService.getByUserId(user.id);
  }

  @Post('addScore')
  async addScore(@GetUser() user: User, @Body('mileage') mileage: number): Promise<void> {
    if (!mileage) {
      throw new BadRequestException('Mileage is not specified');
    }
    const score = new Score();
    score.userId = user.id;
    score.mileage = mileage;
    score.date = new Date();
    await this.scoreService.create(score);
  }
}

export default UserController;
