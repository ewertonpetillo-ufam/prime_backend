import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

@Entity('meem_scores')
export class MeemScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  questionnaire_id: string;

  // Orientação (0-10)
  @Column({ type: 'smallint', nullable: true })
  orientation_day: number | null;

  @Column({ type: 'smallint', nullable: true })
  orientation_date: number | null;

  @Column({ type: 'smallint', nullable: true })
  orientation_month: number | null;

  @Column({ type: 'smallint', nullable: true })
  orientation_year: number | null;

  @Column({ type: 'smallint', nullable: true })
  orientation_time: number | null;

  @Column({ type: 'smallint', nullable: true })
  orientation_location: number | null;

  @Column({ type: 'smallint', nullable: true })
  orientation_institution: number | null;

  @Column({ type: 'smallint', nullable: true })
  orientation_city: number | null;

  @Column({ type: 'smallint', nullable: true })
  orientation_state: number | null;

  @Column({ type: 'smallint', nullable: true })
  orientation_country: number | null;

  // Memória imediata
  @Column({ type: 'smallint', nullable: true })
  registration_word1: number | null;

  @Column({ type: 'smallint', nullable: true })
  registration_word2: number | null;

  @Column({ type: 'smallint', nullable: true })
  registration_word3: number | null;

  // Atenção e cálculo
  @Column({ type: 'smallint', nullable: true })
  attention_calc1: number | null;

  @Column({ type: 'smallint', nullable: true })
  attention_calc2: number | null;

  @Column({ type: 'smallint', nullable: true })
  attention_calc3: number | null;

  @Column({ type: 'smallint', nullable: true })
  attention_calc4: number | null;

  @Column({ type: 'smallint', nullable: true })
  attention_calc5: number | null;

  // Evocação
  @Column({ type: 'smallint', nullable: true })
  recall_word1: number | null;

  @Column({ type: 'smallint', nullable: true })
  recall_word2: number | null;

  @Column({ type: 'smallint', nullable: true })
  recall_word3: number | null;

  // Linguagem
  @Column({ type: 'smallint', nullable: true })
  language_naming1: number | null;

  @Column({ type: 'smallint', nullable: true })
  language_naming2: number | null;

  @Column({ type: 'smallint', nullable: true })
  language_repetition: number | null;

  @Column({ type: 'smallint', nullable: true })
  language_command1: number | null;

  @Column({ type: 'smallint', nullable: true })
  language_command2: number | null;

  @Column({ type: 'smallint', nullable: true })
  language_command3: number | null;

  @Column({ type: 'smallint', nullable: true })
  language_reading: number | null;

  @Column({ type: 'smallint', nullable: true })
  language_writing: number | null;

  @Column({ type: 'smallint', nullable: true })
  language_copying: number | null;

  @Column({ type: 'int', nullable: true })
  total_score: number | null;

  @OneToOne(() => Questionnaire, (q) => q.meem_score, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;
}
