import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

@Entity('patient_medications')
@Index(['questionnaire_id', 'medication_id'], { unique: true })
export class PatientMedication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  questionnaire_id: string;

  @Column({ type: 'int' })
  medication_id: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  dose_mg: number;

  @Column({ type: 'int' })
  doses_per_day: number;

  @Column({ type: 'decimal', precision: 6, scale: 3 })
  led_conversion_factor: number;

  // LED value is generated in the database, but we can calculate it in the app
  // @Column({ type: 'decimal', precision: 10, scale: 2, generatedType: 'STORED', generatedAs: 'dose_mg * led_conversion_factor' })
  // led_value: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Questionnaire, (q) => q.medications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;
}
