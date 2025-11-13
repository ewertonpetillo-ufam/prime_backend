import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('dyskinesia_types')
export class DyskinesiaType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  description: string;
}

