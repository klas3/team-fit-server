import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserController from './user.controller';
import User from '../entity/User';
import UserService from './user.service';
import ScoreService from './score.service';
import Score from '../entity/Score';
import FriendshipService from './friendship.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Score])],
  providers: [UserService, ScoreService, FriendshipService],
  controllers: [UserController],
  exports: [UserService, ScoreService, FriendshipService],
})
class UserModule {}

export default UserModule;
