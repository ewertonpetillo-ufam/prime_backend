import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('education_levels')
export class EducationLevel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  description: string;

  @Column({ type: 'int', nullable: true })
  years_equivalent: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
