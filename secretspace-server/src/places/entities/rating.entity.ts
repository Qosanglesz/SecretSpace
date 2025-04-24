import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne
} from "typeorm";
import {Place} from "./place.entity";

@Entity()
export class Rating {
    @PrimaryGeneratedColumn("uuid")
    rating_id: string;

    @Column({ type: "int", width: 1 })
    stars: number;

    @ManyToOne(() => Place, place => place.ratings, {
        onDelete: "CASCADE"
    })
    place: Place;

    @CreateDateColumn()
    createdAt: Date;
}
