import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

@Entity('pdss2_scores')
export class Pdss2Score {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  questionnaire_id: string;

  @Column({ type: 'smallint', nullable: true })
  q1: number | null;

  @Column({ type: 'smallint', nullable: true })
  q2: number | null;

  @Column({ type: 'smallint', nullable: true })
  q3: number | null;

  @Column({ type: 'smallint', nullable: true })
  q4: number | null;

  @Column({ type: 'smallint', nullable: true })
  q5: number | null;

  @Column({ type: 'smallint', nullable: true })
  q6: number | null;

  @Column({ type: 'smallint', nullable: true })
  q7: number | null;

  @Column({ type: 'smallint', nullable: true })
  q8: number | null;

  @Column({ type: 'smallint', nullable: true })
  q9: number | null;

  @Column({ type: 'smallint', nullable: true })
  q10: number | null;

  @Column({ type: 'smallint', nullable: true })
  q11: number | null;

  @Column({ type: 'smallint', nullable: true })
  q12: number | null;

  @Column({ type: 'smallint', nullable: true })
  q13: number | null;

  @Column({ type: 'smallint', nullable: true })
  q14: number | null;

  @Column({ type: 'smallint', nullable: true })
  q15: number | null;

  @Column({ type: 'int', nullable: true })
  total_score: number | null;

  @OneToOne(() => Questionnaire, (q) => q.pdss2_score, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;
}

