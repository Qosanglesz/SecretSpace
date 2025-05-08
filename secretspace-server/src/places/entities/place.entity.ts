import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    OneToMany
} from "typeorm";
import { Rating } from "./rating.entity";
import { Comment } from "./comment.entity";

@Entity()
export class Place {
    @PrimaryGeneratedColumn("uuid")
    place_id: string;

    @Column({ type: "varchar", length: 50 })
    name: string;

    @Column({ type: "text" })
    description: string;

    @Column({ type: "decimal", precision: 10, scale: 6 })
    latitude: number;

    @Column({ type: "decimal", precision: 10, scale: 6 })
    longitude: number;

    @Column({ type: "bytea", nullable: true })
    image: Buffer | null;

    @OneToMany(() => Rating, rating => rating.place, {
        cascade: true,
        onDelete: "CASCADE",
        nullable: true,
    })
    ratings: Rating[];

    @OneToMany(() => Comment, comment => comment.place, {
        cascade: true,
        onDelete: "CASCADE",
        nullable: true,
    })
    comments: Comment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
