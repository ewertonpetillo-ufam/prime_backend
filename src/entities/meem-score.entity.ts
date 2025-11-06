import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

@Entity('meem_scores')
export class MeemScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  questionnaire_id: string;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @OneToOne(() => Questionnaire, (q) => q.meem_score, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;
}
