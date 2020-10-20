import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Score from '../entity/Score';

@Injectable()
class ScoreService {
  constructor(
    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,
  ) {}

  async create(score: Score): Promise<Score> {
    return this.scoreRepository.save(score);
  }

  async getByUserId(userId: string): Promise<Score[]> {
    return this.scoreRepository.find({ userId });
  }
}

export default ScoreService;
