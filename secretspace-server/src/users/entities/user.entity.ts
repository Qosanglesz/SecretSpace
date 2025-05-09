import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Place} from "../../places/entities/place.entity";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    user_id: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    username: string;

    @Column({ type: 'text' })
    password: string;

    @OneToMany(() => Place, (place) => place.user)
    places: Place[];
}