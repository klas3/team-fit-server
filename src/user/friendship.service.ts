import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/entity/User';
import { Repository } from 'typeorm';
import Friendship from '../entity/Friendship';

@Injectable()
class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
  ) {}

  create(friendship: Friendship): Promise<Friendship> {
    return this.friendshipRepository.save(friendship);
  }

  async accept(id: string): Promise<void> {
    await this.friendshipRepository.update(id, { isAccepted: true });
  }

  getById(id: string): Promise<Friendship | undefined> {
    return this.friendshipRepository.findOne(id, { relations: ['initiator', 'receiver'] });
  }

  getByParticipants(initiatorId: string, receiverId: string): Promise<Friendship | undefined> {
    return this.friendshipRepository.findOne({ initiatorId, receiverId });
  }

  getFriendsListByUserId(userId: string): Promise<Friendship[]> {
    return this.friendshipRepository.find({
      where: [
        { initiatorId: userId, isAccepted: true },
        { receiverId: userId, isAccepted: true },
      ],
      relations: ['initiator', 'receiver'],
    });
  }

  async delete(id: string): Promise<void> {
    await this.friendshipRepository.delete(id);
  }
}

export default FriendshipService;
