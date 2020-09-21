// prettier-ignore
import {
  Column, Entity, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import Coordinate from './Waypoint';
import User from './User';

@Entity()
class Party {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  startPointLatitude?: number;

  @Column()
  startPointLongitude?: number;

  @Column()
  endPointLatitude?: number;

  @Column()
  endPointLongitude?: number;

  @OneToMany(
    (type) => Coordinate,
    (coordinate) => coordinate.party,
  )
  waypoints?: Coordinate[];

  @OneToMany(
    (type) => User,
    (user) => user.party,
  )
  users!: User[];
}

export default Party;
