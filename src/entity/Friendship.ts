// prettier-ignore
import {
  Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import User from './User';

@Entity()
class Friendship {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToMany((type) => User)
  @JoinTable()
  firstUser!: User;

  @ManyToMany((type) => User)
  @JoinTable()
  secondUser!: User;
}

export default Friendship;
