// prettier-ignore
import {
  Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IsNotEmpty } from 'class-validator';
import Score from './Score';
import Party from './Party';
import MarkerColors from './MarkerColor';

@Entity()
class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @IsNotEmpty()
  @Column()
  login!: string;

  @IsNotEmpty()
  @Column()
  password!: string;

  @IsNotEmpty()
  @Column()
  email!: string;

  @Column()
  resetCode?: string;

  @Column()
  lastResetCodeCreationTime?: Date;

  @Column('float')
  currentLatitude?: number;

  @Column('float')
  currentLongitude?: number;

  @Column()
  partyId!: string;

  @ManyToOne(
    () => Party,
    (party) => party.users,
  )
  party!: Party;

  @OneToMany(
    () => Score,
    (score) => score.userId,
  )
  scores!: Score[];

  @Column()
  markerColor!: MarkerColors;

  async changePassword(newPassword: string): Promise<void> {
    this.password = await bcrypt.hash(newPassword, 10);
  }

  comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  setResetCode(code: string | undefined): void {
    if (code) {
      this.lastResetCodeCreationTime = new Date();
    } else {
      this.lastResetCodeCreationTime = undefined;
    }
    this.resetCode = code;
  }
}

export default User;
