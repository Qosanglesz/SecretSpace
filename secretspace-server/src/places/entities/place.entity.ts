import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PlaceImage } from './place-image.entity';
import { Comment } from './comment.entity';
import { Rating } from './rating.entity';

@Entity('places')
export class Place {
  @PrimaryGeneratedColumn('uuid')
  place_id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @ManyToOne(() => User, user => user.places)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => PlaceImage, image => image.place, { cascade: true })
  images: PlaceImage[];

  @OneToMany(() => Comment, comment => comment.place, { cascade: true })
  comments: Comment[];

  @OneToMany(() => Rating, rating => rating.place, { cascade: true })
  ratings: Rating[];
}