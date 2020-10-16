// prettier-ignore
import {
  BadRequestException, Body, Controller, ForbiddenException, Get, NotFoundException, Post,
} from '@nestjs/common';
import Friendship from 'src/entity/Friendship';
import { Authorize, GetUser } from '../auth/auth.decorators';
import User from '../entity/User';
import FriendshipService from './friendship.service';
import UserService from './user.service';

@Authorize()
@Controller('friendship')
class FriendshipController {
  constructor(
    private readonly friendshipService: FriendshipService,
    private readonly userService: UserService,
  ) {}

  @Get('list')
  async getList(@GetUser() user: User): Promise<Friendship[]> {
    const friendshipsList = await this.friendshipService.getFriendsListByUserId(user.id);
    const safeFriendshipsList = friendshipsList.map((friendship, index) => {
      const safeFriendship = { ...friendship };
      const { initiator, receiver } = friendshipsList[index];
      safeFriendship.initiator = new User();
      safeFriendship.initiator.id = initiator.id;
      safeFriendship.initiator.login = initiator.login;
      safeFriendship.receiver = new User();
      safeFriendship.receiver.id = receiver.id;
      safeFriendship.receiver.login = receiver.login;
      return safeFriendship;
    });
    return safeFriendshipsList;
  }

  @Post('create')
  async create(
    @GetUser() initiator: User,
    @Body('receiverLogin') receiverLogin: string,
  ): Promise<void> {
    if (!receiverLogin) {
      throw new BadRequestException('Receiver login is not specified');
    }
    if (initiator.login === receiverLogin) {
      throw new BadRequestException("You can't send friendship request to yourself");
    }
    const receiver = await this.userService.getByLogin(receiverLogin);
    if (!receiver) {
      throw new NotFoundException('Requested user is not found');
    }
    const initiatorsSentRequest = await this.friendshipService.getByParticipants(
      initiator.id,
      receiver.id,
    );
    if (initiatorsSentRequest) {
      throw new ForbiddenException("You've already sent friendship request to this user");
    }
    const receiverSentRequest = await this.friendshipService.getByParticipants(
      receiver.id,
      initiator.id,
    );
    if (receiverSentRequest) {
      throw new ForbiddenException('This user is already sent you a friendship request');
    }
    const friendship = new Friendship();
    friendship.initiatorId = initiator.id;
    friendship.receiverId = receiver.id;
    await this.friendshipService.create(friendship);
  }

  @Post('accept')
  async accept(@GetUser() user: User, @Body('friendshipId') friendshipId: string): Promise<void> {
    const friendship = await this.getFriendship(friendshipId);
    if (friendship.receiver.id !== user.id) {
      throw new ForbiddenException("You can't accept this friendship request");
    }
    if (friendship.isAccepted) {
      throw new ForbiddenException("You've already accepted this friendship request");
    }
    await this.friendshipService.accept(friendshipId);
  }

  @Post('delete')
  async delete(@GetUser() user: User, @Body('friendshipId') friendshipId: string): Promise<void> {
    const friendship = await this.getFriendship(friendshipId);
    if (friendship.initiator.id !== user.id && friendship.receiver.id !== user.id) {
      throw new ForbiddenException('You are not a part of this friendship');
    }
    await this.friendshipService.delete(friendshipId);
  }

  private async getFriendship(friendshipId: string): Promise<Friendship> {
    if (!friendshipId) {
      throw new BadRequestException('Friendship request is not specified');
    }
    const friendship = await this.friendshipService.getById(friendshipId);
    if (!friendship) {
      throw new NotFoundException("Can't find friendship request");
    }
    return friendship;
  }
}

export default FriendshipController;
