// prettier-ignore
import {
  Column,
  Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import User from './User';

@Entity()
class Friendship {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  isAccepted!: boolean;

  @Column()
  initiatorId!: string;

  @Column()
  receiverId!: string;

  @ManyToOne(() => User)
  @JoinTable()
  initiator!: User;

  @ManyToOne(() => User)
  @JoinTable()
  receiver!: User;
}

export default Friendship;
