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
    @Body('login') login: string,
    @Body('password') password: string,
  ): Promise<{ authToken: string }> {
    if (!login || !password) {
      throw new BadRequestException();
    }
    const user = await this.userService.getBylogin(login);
    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedException("The credentials you've provided was incorrect");
    }
    return { authToken: await this.authService.login(user) };
  }

  @Post('register')
  async register(@Body() incommingUser: User): Promise<void> {
    const user = incommingUser;
    if (!(await this.userService.isloginUnique(user.login))) {
      throw new BadRequestException(`The login ${user.login} is already in use`);
    }
    if (!(await this.userService.isEmailUnique(user.email))) {
      throw new BadRequestException('This email is already in use');
    }
    const party = await this.partyService.create();
    user.partyId = party.id;
    await this.authService.register(user);
    // eslint-disable-next-line no-useless-return
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
      throw new UnauthorizedException('Your old password is incorrect');
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
      throw new ForbiddenException('Wrong reset code');
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
      throw new ForbiddenException('Your reset code is expired');
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
      throw new ForbiddenException('Wrong reset code');
    }
    return this.authService.resetPassword(newPassword, user);
  }
}

export default AuthController;
