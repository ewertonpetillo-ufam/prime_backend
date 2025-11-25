import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

@Entity('stopbang_scores')
export class StopbangScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  questionnaire_id: string;

  // STOP questions
  @Column({ type: 'boolean', default: false })
  snoring: boolean;

  @Column({ type: 'boolean', default: false })
  tired: boolean;

  @Column({ type: 'boolean', default: false })
  observed_apnea: boolean;

  @Column({ type: 'boolean', default: false })
  blood_pressure: boolean;

  // BANG questions
  @Column({ type: 'boolean', default: false })
  bmi_over_35: boolean;

  @Column({ type: 'boolean', default: false })
  age_over_50: boolean;

  @Column({ type: 'boolean', default: false })
  neck_circumference_large: boolean;

  @Column({ type: 'boolean', default: false })
  gender_male: boolean;

  @Column({ type: 'int', nullable: true })
  total_score: number | null;

  @OneToOne(() => Questionnaire, (q) => q.stopbang_score, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;
}
