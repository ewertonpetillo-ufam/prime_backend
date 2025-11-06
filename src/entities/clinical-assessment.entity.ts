import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

@Entity('clinical_assessments')
export class ClinicalAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  questionnaire_id: string;

  @Column({ type: 'int', nullable: true })
  diagnosis_year: number;

  @Column({ type: 'int', nullable: true })
  phenotype_id: number;

  @Column({ type: 'int', nullable: true })
  hoehn_yahr_stage_id: number;

  @Column({ type: 'boolean', nullable: true })
  motor_fluctuations: boolean;

  @Column({ type: 'boolean', nullable: true })
  wearing_off: boolean;

  @Column({ type: 'boolean', nullable: true })
  dyskinesia: boolean;

  @Column({ type: 'int', nullable: true })
  dyskinesia_type_id: number;

  @Column({ type: 'boolean', nullable: true })
  previous_surgery: boolean;

  @Column({ type: 'int', nullable: true })
  surgery_type_id: number;

  @Column({ type: 'int', nullable: true })
  surgery_year: number;

  @Column({ type: 'text', nullable: true })
  comorbidities: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToOne(() => Questionnaire, (q) => q.clinical_assessment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;
}
