import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

@Entity('rbdsq_scores')
export class RbdsqScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  questionnaire_id: string;

  @Column({ type: 'boolean', default: false })
  q1_vivid_dreams: boolean;

  @Column({ type: 'boolean', default: false })
  q2_aggressive_content: boolean;

  @Column({ type: 'boolean', default: false })
  q3_dream_enactment: boolean;

  @Column({ type: 'boolean', default: false })
  q4_limb_movements: boolean;

  @Column({ type: 'boolean', default: false })
  q5_injury_potential: boolean;

  @Column({ type: 'boolean', default: false })
  q6_bed_disruption: boolean;

  @Column({ type: 'boolean', default: false })
  q7_awakening_recall: boolean;

  @Column({ type: 'boolean', default: false })
  q8_sleep_disruption: boolean;

  // Additional context questions
  @Column({ type: 'boolean', default: false })
  q9_neurological_disorder: boolean;

  @Column({ type: 'boolean', default: false })
  q10_rem_behavior_problem: boolean;

  @Column({ type: 'int', nullable: true })
  total_score: number | null;

  @OneToOne(() => Questionnaire, (q) => q.rbdsq_score, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;
}
