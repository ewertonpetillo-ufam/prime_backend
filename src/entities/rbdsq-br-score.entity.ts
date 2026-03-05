import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

@Entity('rbdsq_br_scores')
export class RbdsqBrScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  questionnaire_id: string;

  @Column({ type: 'boolean', default: false })
  q1_realistic_dreams: boolean;

  @Column({ type: 'boolean', default: false })
  q2_aggressive_dreams: boolean;

  @Column({ type: 'boolean', default: false })
  q3_dream_enactment: boolean;

  @Column({ type: 'boolean', default: false })
  q4_limb_movements: boolean;

  @Column({ type: 'boolean', default: false })
  q5_injury_potential: boolean;

  @Column({ type: 'boolean', default: false })
  q6_1_vocalizations: boolean;

  @Column({ type: 'boolean', default: false })
  q6_2_fighting_movements: boolean;

  @Column({ type: 'boolean', default: false })
  q6_3_complex_movements_or_falls: boolean;

  @Column({ type: 'boolean', default: false })
  q6_4_objects_falling: boolean;

  @Column({ type: 'boolean', default: false })
  q7_movements_cause_awakenings: boolean;

  @Column({ type: 'boolean', default: false })
  q8_dream_recall: boolean;

  @Column({ type: 'boolean', default: false })
  q9_disturbed_sleep: boolean;

  @Column({ type: 'boolean', default: false })
  q10_neurological_disease: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  neuro_disease_description: string | null;

  @Column({ type: 'int', nullable: true })
  total_score: number | null;

  @OneToOne(() => Questionnaire, (q) => q.rbdsq_br_score, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;
}

