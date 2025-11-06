import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

@Entity('patient_medications')
export class PatientMedication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  questionnaire_id: string;

  @Column({ type: 'int' })
  medication_reference_id: number;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  daily_dose_mg: number;

  @Column({ type: 'int', nullable: true })
  frequency_per_day: number;

  @ManyToOne(() => Questionnaire, (q) => q.medications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;
}
