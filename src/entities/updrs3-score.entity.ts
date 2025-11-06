import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

@Entity('updrs_part3_scores')
export class Updrs3Score {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  questionnaire_id: string;

  @Column({ type: 'jsonb', nullable: true })
  scores: any;

  @Column({ type: 'int', nullable: true })
  total_score: number;

  @OneToOne(() => Questionnaire, (q) => q.updrs3_score, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;
}
