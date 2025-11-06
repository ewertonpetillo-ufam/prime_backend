import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('income_ranges')
export class IncomeRange {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  description: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  min_salary: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  max_salary: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
