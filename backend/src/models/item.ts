import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,} from "typeorm";

@Entity("items")
export class Item {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}