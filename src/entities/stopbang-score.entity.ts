import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

@Entity('stopbang_scores')
export class StopbangScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  questionnaire_id: string;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @OneToOne(() => Questionnaire, (q) => q.stopbang_score, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;
}
