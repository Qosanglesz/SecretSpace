import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne
} from "typeorm";
import {Place} from "./place.entity";


@Entity()
export class Comment {
    @PrimaryGeneratedColumn("uuid")
    comment_id: string;

    @Column("text")
    content: string;

    @ManyToOne(() => Place, place => place.comments, {
        onDelete: "CASCADE"
    })
    place: Place;

    @CreateDateColumn()
    createdAt: Date;
}
