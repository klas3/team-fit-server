// prettier-ignore
import {
  Column,
  Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import User from './User';

@Entity()
class Friendship {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  isAccepted!: boolean;

  @ManyToMany(() => User)
  @JoinTable()
  firstUser!: User;

  @ManyToMany(() => User)
  @JoinTable()
  secondUser!: User;
}

export default Friendship;
