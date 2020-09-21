import {
  Controller,
  Post,
  Body,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import User from '../entity/User';
import AuthService from './auth.service';
import { Authorize, GetUser } from './auth.decorators';
import UserService from '../user/user.service';
import PartyService from '../party/party.service';

@Controller('auth')
class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly partyService: PartyService,
  ) {}

  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
  ): Promise<{ authToken: string }> {
    if (!username || !password) {
      throw new BadRequestException();
    }
    const user = await this.userService.getByUsername(username);
    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedException('Неправильний логін або пароль');
    }
    return { authToken: await this.authService.login(user) };
  }

  @Post('register')
  async register(@Body() incomingUser: User): Promise<void> {
    const user = incomingUser;
    await this.verifyRegistration(user);
    const registeredUser = await this.authService.register(user);
    await this.partyService.create(registeredUser);
    // eslint-disable-next-line
    return;
  }

  @Authorize()
  @Post('changePassword')
  async changePassword(
    @GetUser() user: User,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
  ): Promise<void> {
    if (!oldPassword || !newPassword) {
      throw new BadRequestException();
    }
    if (!(await user.comparePassword(oldPassword))) {
      throw new UnauthorizedException('Неправильний старий пароль');
    }
    return this.authService.changePassword(user, newPassword);
  }

  @Post('requestResetPassword')
  async requestResetPassword(@Body('email') email: string): Promise<void> {
    if (!email) {
      throw new BadRequestException();
    }
    const user = await this.userService.getByEmail(email);
    if (!user) {
      throw new NotFoundException();
    }
    return this.authService.requestResetPassword(user);
  }

  @Post('verifyResetCode')
  async verifyResetCode(@Body('email') email: string, @Body('code') code: string): Promise<void> {
    if (!email || !code) {
      throw new BadRequestException();
    }
    const user = await this.userService.getByEmail(email);
    if (!user) {
      throw new NotFoundException();
    }
    if (user.resetCode !== code) {
      throw new ForbiddenException('Ви ввели невірний код');
    }
    if (
      // prettier-ignore
      user.lastResetCodeCreationTime
      && new Date(
        user.lastResetCodeCreationTime.getTime()
        + this.authService.extraResetCodeMinutes * this.authService.msMinutes,
      ).getTime() < new Date().getTime()
    ) {
      await this.userService.clearResetCode(user.id);
      throw new ForbiddenException('Ваш код вже недійсний');
    }
  }

  @Post('resetPassword')
  async resetPassword(
    @Body('email') email: string,
    @Body('code') code: string,
    @Body('newPassword') newPassword: string,
  ): Promise<void> {
    if (!email || !code || !newPassword) {
      throw new BadRequestException();
    }
    const user = await this.userService.getByEmail(email);
    if (!user) {
      throw new NotFoundException();
    }
    if (user.resetCode !== code) {
      throw new ForbiddenException('Ви ввели невірний код');
    }
    return this.authService.resetPassword(newPassword, user);
  }

  private async verifyRegistration(user: User): Promise<void> {
    if (!(await this.userService.isUsernameUnique(user.username))) {
      throw new BadRequestException(`Логін ${user.username} вже зайнятий`);
    }
    if (!(await this.userService.isEmailUnique(user.email))) {
      throw new BadRequestException('Ця пошта вже зареєстрована');
    }
  }
}

export default AuthController;
