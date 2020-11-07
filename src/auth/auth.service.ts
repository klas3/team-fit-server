import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import UserService from '../user/user.service';
import User from '../entity/User';
import EmailService from '../email/email.service';
import MarkerColor from '../entity/MarkerColor';

@Injectable()
class AuthService {
  public readonly extraResetCodeMinutes: number = 5;

  public readonly msMinutes: number = 60 * 1000;

  private readonly resetCodeLength: number = 8;

  private readonly hashRounds: number = 10;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(user: User): Promise<User> {
    const newUser = user;
    newUser.markerColor = MarkerColor.black;
    newUser.password = await bcrypt.hash(newUser.password, this.hashRounds);
    return this.userService.create(newUser);
  }

  async login(user: User): Promise<string> {
    const payload = {
      id: user.id,
      login: user.login,
      password: user.password,
    };
    return this.jwtService.sign(payload);
  }

  async changePassword(user: User, newPassword: string): Promise<void> {
    await user.changePassword(newPassword);
    await this.userService.update(user);
  }

  async requestResetPassword(user: User): Promise<void> {
    const resetCode = this.generateResetCode();
    user.setResetCode(resetCode);
    await this.userService.update(user);
    await this.emailService.sendEmailAsync(user.email, 'Password recovery', user.login, resetCode);
  }

  async resetPassword(newPassword: string, user: User): Promise<void> {
    await user.changePassword(newPassword);
    user.setResetCode(undefined);
    await this.userService.update(user);
  }

  private generateResetCode(): string {
    const result: string[] = [];
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < this.resetCodeLength; i += 1) {
      result.push(characters.charAt(Math.floor(Math.random() * characters.length)));
    }
    return result.join('');
  }
}

export default AuthService;
