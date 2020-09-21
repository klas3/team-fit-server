import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import User from '../entity/User';

@Injectable()
class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async update(user: User): Promise<void> {
    await this.userRepository.update(user.id, user);
  }

  async getById(id: string): Promise<User | undefined> {
    return this.userRepository.findOne({ id });
  }

  async isUsernameUnique(username: string): Promise<boolean> {
    return (await this.userRepository.findOne({ username })) === undefined;
  }

  async isEmailUnique(email: string): Promise<boolean> {
    return (await this.userRepository.findOne({ email })) === undefined;
  }

  async getEmailById(id: string): Promise<string> {
    const { email } = (await this.userRepository.findOne(id)) as User;
    return email;
  }

  async getByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ username });
  }

  async getByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ email });
  }

  async setResetCode(resetCode: string, id: string): Promise<void> {
    const user = await this.userRepository.findOne(id);
    await this.userRepository.update(id, { ...user, resetCode });
  }

  async clearResetCode(id: string): Promise<void> {
    const user = await this.userRepository.findOne(id);
    await this.userRepository.update(id, { ...user, resetCode: undefined });
  }
}

export default UserService;
