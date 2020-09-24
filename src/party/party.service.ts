import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Party from 'src/entity/Party';
import Waypoint from 'src/entity/Waypoint';
import { Repository } from 'typeorm';
import User from '../entity/User';

@Injectable()
class PartyService {
  constructor(
    @InjectRepository(Party)
    private readonly partyRepository: Repository<Party>,
  ) {}

  async create(creator: User): Promise<Party> {
    return this.partyRepository.save({ users: [creator] });
  }

  async getById(id: string): Promise<Party | undefined> {
    return this.partyRepository.findOne({ id });
  }

  async update(party: Party): Promise<void> {
    await this.partyRepository.update(party.id, party);
  }

  async delete(id: string): Promise<void> {
    await this.partyRepository.delete(id);
  }
}

export default PartyService;
