import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

@Entity('updrs_part3_scores')
export class Updrs3Score {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  questionnaire_id: string;

  // Items sem lateralidade
  @Column({ type: 'smallint', nullable: true })
  speech: number | null;

  @Column({ type: 'smallint', nullable: true })
  facial_expression: number | null;

  @Column({ type: 'smallint', nullable: true })
  rising_from_chair: number | null;

  @Column({ type: 'smallint', nullable: true })
  gait: number | null;

  @Column({ type: 'smallint', nullable: true })
  freezing_of_gait: number | null;

  @Column({ type: 'smallint', nullable: true })
  postural_stability: number | null;

  @Column({ type: 'smallint', nullable: true })
  posture: number | null;

  @Column({ type: 'smallint', nullable: true })
  global_bradykinesia: number | null;

  @Column({ type: 'smallint', nullable: true })
  postural_tremor_amplitude: number | null;

  // Rigidez
  @Column({ type: 'smallint', nullable: true })
  rigidity_neck: number | null;

  @Column({ type: 'smallint', nullable: true })
  rigidity_rue: number | null;

  @Column({ type: 'smallint', nullable: true })
  rigidity_lue: number | null;

  @Column({ type: 'smallint', nullable: true })
  rigidity_rle: number | null;

  @Column({ type: 'smallint', nullable: true })
  rigidity_lle: number | null;

  // Itens bilaterais
  @Column({ type: 'smallint', nullable: true })
  finger_tapping_right: number | null;

  @Column({ type: 'smallint', nullable: true })
  finger_tapping_left: number | null;

  @Column({ type: 'smallint', nullable: true })
  hand_movements_right: number | null;

  @Column({ type: 'smallint', nullable: true })
  hand_movements_left: number | null;

  @Column({ type: 'smallint', nullable: true })
  pronation_supination_right: number | null;

  @Column({ type: 'smallint', nullable: true })
  pronation_supination_left: number | null;

  @Column({ type: 'smallint', nullable: true })
  toe_tapping_right: number | null;

  @Column({ type: 'smallint', nullable: true })
  toe_tapping_left: number | null;

  @Column({ type: 'smallint', nullable: true })
  leg_agility_right: number | null;

  @Column({ type: 'smallint', nullable: true })
  leg_agility_left: number | null;

  @Column({ type: 'smallint', nullable: true })
  postural_tremor_right: number | null;

  @Column({ type: 'smallint', nullable: true })
  postural_tremor_left: number | null;

  @Column({ type: 'smallint', nullable: true })
  kinetic_tremor_right: number | null;

  @Column({ type: 'smallint', nullable: true })
  kinetic_tremor_left: number | null;

  // Tremor de repouso
  @Column({ type: 'smallint', nullable: true })
  rest_tremor_rue: number | null;

  @Column({ type: 'smallint', nullable: true })
  rest_tremor_lue: number | null;

  @Column({ type: 'smallint', nullable: true })
  rest_tremor_rle: number | null;

  @Column({ type: 'smallint', nullable: true })
  rest_tremor_lle: number | null;

  @Column({ type: 'smallint', nullable: true })
  rest_tremor_lip_jaw: number | null;

  // Impacto das discinesias
  @Column({ type: 'boolean', nullable: true })
  dyskinesia_present: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  dyskinesia_interfered: boolean | null;

  @Column({ type: 'int', nullable: true })
  total_score: number | null;

  @OneToOne(() => Questionnaire, (q) => q.updrs3_score, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;
}
