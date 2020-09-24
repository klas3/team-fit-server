// prettier-ignore
import {
  Column, Entity, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import Party from './Party';

@Entity()
class Waypoint {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  partyId?: string;

  @ManyToOne(
    () => Party,
    (party) => party.waypoints,
  )
  party?: Party;

  @Column('float')
  latitude!: number;

  @Column('float')
  longitude!: number;
}

export default Waypoint;
