import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Party from '../entity/Party';
import User from '../entity/User';

@Injectable()
class PartyService {
  constructor(
    @InjectRepository(Party)
    private readonly partyRepository: Repository<Party>,
  ) {}

  async create(creator?: User): Promise<Party> {
    const party = !creator ? {} : { users: [creator] };
    return this.partyRepository.save(party);
  }

  async getById(id: string): Promise<Party | undefined> {
    return this.partyRepository.findOne({ id }, { relations: ['users'] });
  }

  async update(party: Party): Promise<void> {
    await this.partyRepository.update(party.id, party);
  }

  async delete(id: string): Promise<void> {
    await this.partyRepository.delete(id);
  }
}

export default PartyService;
