import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('medications_reference')
export class MedicationReference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  drug_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  generic_name: string;

  @Column({ type: 'decimal', precision: 6, scale: 3, default: 1.0 })
  led_conversion_factor: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  medication_class: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;
}

