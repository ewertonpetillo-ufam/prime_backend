import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('parkinson_phenotypes')
export class ParkinsonPhenotype {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  description: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}

