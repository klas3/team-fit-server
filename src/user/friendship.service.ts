import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Friendship from '../entity/Friendship';

@Injectable()
class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
  ) {}

  async create(friendship: Friendship): Promise<Friendship> {
    return this.friendshipRepository.save(friendship);
  }

  async accept(id: string): Promise<void> {
    await this.friendshipRepository.update(id, { isAccepted: true });
  }

  // TODO Test that on searching
  async getByUserId(userId: string): Promise<Friendship[]> {
    return this.friendshipRepository.find({
      where: [{ firstUser: userId }, { secondUser: userId }],
    });
  }

  async delete(id: string): Promise<void> {
    await this.friendshipRepository.delete(id);
  }
}

export default FriendshipService;
