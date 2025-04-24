import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    user_id: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    username: string;

    @Column({ type: 'text' })
    password: string;
}