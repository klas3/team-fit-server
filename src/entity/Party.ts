// prettier-ignore
import {
  Column, Entity, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import User from './User';
import Waypoint from './Waypoint';

@Entity()
class Party {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('float')
  startPointLatitude?: number;

  @Column('float')
  startPointLongitude?: number;

  @Column('float')
  endPointLatitude?: number;

  @Column('float')
  endPointLongitude?: number;

  @OneToMany(
    () => Waypoint,
    (waypoint) => waypoint.party,
  )
  waypoints?: Waypoint[];

  @OneToMany(
    () => User,
    (user) => user.party,
  )
  users!: User[];
}

export default Party;
