import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('surgery_types')
export class SurgeryType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  description: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}

