import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

@Entity('udysrs_scores')
export class UdysrsScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  questionnaire_id: string;

  // Parte 1A
  @Column({ type: 'smallint', nullable: true })
  on_dyskinesia_time: number | null;

  // Parte 1B
  @Column({ type: 'smallint', nullable: true })
  impact_speech: number | null;

  @Column({ type: 'smallint', nullable: true })
  impact_chewing: number | null;

  @Column({ type: 'smallint', nullable: true })
  impact_eating: number | null;

  @Column({ type: 'smallint', nullable: true })
  impact_dressing: number | null;

  @Column({ type: 'smallint', nullable: true })
  impact_hygiene: number | null;

  @Column({ type: 'smallint', nullable: true })
  impact_writing: number | null;

  @Column({ type: 'smallint', nullable: true })
  impact_hobbies: number | null;

  @Column({ type: 'smallint', nullable: true })
  impact_walking: number | null;

  @Column({ type: 'smallint', nullable: true })
  impact_social: number | null;

  @Column({ type: 'smallint', nullable: true })
  impact_emotional: number | null;

  // Parte 2A
  @Column({ type: 'smallint', nullable: true })
  off_dystonia_time: number | null;

  // Parte 2B
  @Column({ type: 'smallint', nullable: true })
  dystonia_activities: number | null;

  @Column({ type: 'smallint', nullable: true })
  dystonia_pain_impact: number | null;

  @Column({ type: 'smallint', nullable: true })
  dystonia_pain_severity: number | null;

  // Parte 3
  @Column({ type: 'smallint', nullable: true })
  severity_face: number | null;

  @Column({ type: 'smallint', nullable: true })
  severity_neck: number | null;

  @Column({ type: 'smallint', nullable: true })
  severity_right_arm: number | null;

  @Column({ type: 'smallint', nullable: true })
  severity_left_arm: number | null;

  @Column({ type: 'smallint', nullable: true })
  severity_trunk: number | null;

  @Column({ type: 'smallint', nullable: true })
  severity_right_leg: number | null;

  @Column({ type: 'smallint', nullable: true })
  severity_left_leg: number | null;

  // Parte 4
  @Column({ type: 'smallint', nullable: true })
  disability_communication: number | null;

  @Column({ type: 'smallint', nullable: true })
  disability_drinking: number | null;

  @Column({ type: 'smallint', nullable: true })
  disability_dressing: number | null;

  @Column({ type: 'smallint', nullable: true })
  disability_walking: number | null;

  @Column({ type: 'int', nullable: true })
  historical_subscore: number | null;

  @Column({ type: 'int', nullable: true })
  objective_subscore: number | null;

  @Column({ type: 'int', nullable: true })
  total_score: number | null;

  @OneToOne(() => Questionnaire, (q) => q.udysrs_score, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;
}
