import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Place } from "./place.entity";

@Entity()
export class PlaceImage {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "bytea" })
    image: Buffer;

    @ManyToOne(() => Place, place => place.images, {
        onDelete: "CASCADE"
    })
    place: Place;
}
