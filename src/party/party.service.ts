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
    @InjectRepository(Waypoint)
    private readonly waypointRepository: Repository<Waypoint>,
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

  async createWaypoint(waypoint: Waypoint): Promise<Waypoint> {
    return this.waypointRepository.save(waypoint);
  }

  async getWaypoints(partyId: string): Promise<Waypoint[]> {
    return this.waypointRepository.find({ partyId });
  }

  async deleteWaypoints(partyId: string): Promise<void> {
    await this.waypointRepository.delete({ partyId });
  }

  async delete(partyId: string): Promise<void> {
    await this.partyRepository.delete(partyId);
  }
}

export default PartyService;
