import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Generated,
} from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

@Entity('anthropometric_data')
export class AnthropometricData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  questionnaire_id: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  weight_kg: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  height_cm: number;

  // BMI is calculated in database with GENERATED column
  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    generatedType: 'STORED',
    asExpression: 'weight_kg / ((height_cm / 100) * (height_cm / 100))',
  })
  bmi: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  waist_circumference_cm: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  hip_circumference_cm: number;

  // Waist-hip ratio is calculated in database with GENERATED column
  @Column({
    type: 'numeric',
    precision: 4,
    scale: 3,
    nullable: true,
    generatedType: 'STORED',
    asExpression: 'waist_circumference_cm / NULLIF(hip_circumference_cm, 0)',
  })
  waist_hip_ratio: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  neck_circumference_cm: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  // Relations
  @OneToOne(() => Questionnaire, (questionnaire) => questionnaire.anthropometric_data, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;
}
