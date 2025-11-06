import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('gender_types')
export class GenderType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  description: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
