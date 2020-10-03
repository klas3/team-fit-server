import { Controller, Get } from '@nestjs/common';
import { Authorize, GetUser } from 'src/auth/auth.decorators';
import User from 'src/entity/User';

@Authorize()
@Controller('user')
class UserController {
  @Get('info')
  async getInfo(@GetUser() user: User): Promise<{ email: string; login: string }> {
    return { email: user.email, login: user.login };
  }

  @Get('id')
  async getId(@GetUser() user: User): Promise<{ id: string }> {
    return { id: user.id };
  }
}

export default UserController;
