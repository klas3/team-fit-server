import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Waypoint from 'src/entity/Waypoint';
import { Repository } from 'typeorm';

@Injectable()
class WaypointService {
  constructor(
    @InjectRepository(Waypoint)
    private readonly waypointRepository: Repository<Waypoint>,
  ) {}

  async create(waypoint: Waypoint): Promise<Waypoint> {
    return this.waypointRepository.save(waypoint);
  }

  async getByPartyId(partyId: string): Promise<Waypoint[]> {
    return this.waypointRepository.find({ partyId });
  }

  async deleteByPartyId(partyId: string): Promise<void> {
    await this.waypointRepository.delete({ partyId });
  }
}

export default WaypointService;
