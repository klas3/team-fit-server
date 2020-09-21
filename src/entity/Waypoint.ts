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
    (type) => Party,
    (party) => party.waypoints,
  )
  party?: Party;

  @Column()
  latitude!: string;

  @Column()
  longitude!: string;
}

export default Waypoint;
