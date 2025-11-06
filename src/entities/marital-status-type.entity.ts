import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('marital_status_types')
export class MaritalStatusType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  description: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
