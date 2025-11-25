import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

@Entity('fogq_scores')
export class FogqScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  questionnaire_id: string;

  @Column({ type: 'smallint', nullable: true })
  gait_worst_state: number | null;

  @Column({ type: 'smallint', nullable: true })
  impact_daily_activities: number | null;

  @Column({ type: 'smallint', nullable: true })
  feet_stuck: number | null;

  @Column({ type: 'smallint', nullable: true })
  longest_episode: number | null;

  @Column({ type: 'smallint', nullable: true })
  hesitation_initiation: number | null;

  @Column({ type: 'smallint', nullable: true })
  hesitation_turning: number | null;

  @Column({ type: 'int', nullable: true })
  total_score: number | null;

  @OneToOne(() => Questionnaire, (q) => q.fogq_score, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;
}
