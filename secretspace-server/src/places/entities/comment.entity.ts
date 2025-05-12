import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Place } from './place.entity';
import { User } from '../../users/entities/user.entity';
import { Rating } from './rating.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  comment_id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Place, place => place.comments)
  @JoinColumn({ name: 'place_id' })
  place: Place;

  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Rating, rating => rating.comment)
  rating: Rating;
}