import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Score from 'src/entity/Score';
import { Repository } from 'typeorm';

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

  async update(score: Score): Promise<void> {
    await this.scoreRepository.update(score.id, score);
  }
}

export default ScoreService;
