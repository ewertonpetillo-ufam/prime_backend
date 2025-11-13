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

  // Diagnosis information
  @Column({ type: 'text' })
  diagnostic_description: string;

  @Column({ type: 'int', nullable: true })
  age_at_onset: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  initial_symptom: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  affected_side: string; // 'Direito', 'Esquerdo', 'Bilateral', 'Não especificado'

  // Phenotype and staging
  @Column({ type: 'int', nullable: true })
  phenotype_id: number;

  @Column({ type: 'int', nullable: true })
  hoehn_yahr_stage_id: number;

  @Column({ type: 'int', nullable: true })
  schwab_england_score: number;

  // Family history
  @Column({ type: 'boolean', default: false })
  has_family_history: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  family_kinship_degree: string;

  // Motor fluctuations
  @Column({ type: 'boolean', default: false })
  has_dyskinesia: boolean;

  @Column({ type: 'boolean', default: false })
  dyskinesia_interfered: boolean;

  @Column({ type: 'int', nullable: true })
  dyskinesia_type_id: number;

  @Column({ type: 'boolean', default: false })
  has_freezing_of_gait: boolean;

  @Column({ type: 'boolean', default: false })
  has_wearing_off: boolean;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  average_on_time_hours: number;

  @Column({ type: 'boolean', default: false })
  has_delayed_on: boolean;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  ldopa_onset_time_hours: number;

  // Medication status at assessment
  @Column({ type: 'boolean', default: false })
  assessed_on_levodopa: boolean;

  // Surgery history
  @Column({ type: 'boolean', default: false })
  has_surgery_history: boolean;

  @Column({ type: 'int', nullable: true })
  surgery_year: number;

  @Column({ type: 'int', nullable: true })
  surgery_type_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  surgery_target: string;

  // Clinical notes
  @Column({ type: 'text', nullable: true })
  comorbidities: string;

  @Column({ type: 'text', nullable: true })
  other_medications: string;

  @Column({ type: 'text', nullable: true })
  disease_evolution: string;

  @Column({ type: 'text', nullable: true })
  current_symptoms: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToOne(() => Questionnaire, (q) => q.clinical_assessment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;
}
