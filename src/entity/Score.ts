// prettier-ignore
import {
  Column, Entity, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import User from './User';

@Entity()
class Score {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(
    (type) => User,
    (user) => user.scores,
  )
  user!: User;

  @Column()
  date!: Date;

  @Column()
  mileage!: number;
}

export default Score;
