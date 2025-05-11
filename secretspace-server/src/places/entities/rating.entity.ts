import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Place } from './place.entity';
import { Comment } from './comment.entity';

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  rating_id: string;

  @Column({ type: 'int' })
  value: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Place, place => place.ratings)
  @JoinColumn({ name: 'place_id' })
  place: Place;

  @OneToOne(() => Comment, comment => comment.rating)
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;
}