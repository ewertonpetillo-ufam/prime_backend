import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

@Entity('epworth_scores')
export class EpworthScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  questionnaire_id: string;

  @Column({ type: 'smallint', nullable: true })
  sitting_reading: number | null;

  @Column({ type: 'smallint', nullable: true })
  watching_tv: number | null;

  @Column({ type: 'smallint', nullable: true })
  sitting_inactive_public: number | null;

  @Column({ type: 'smallint', nullable: true })
  passenger_car: number | null;

  @Column({ type: 'smallint', nullable: true })
  lying_down_afternoon: number | null;

  @Column({ type: 'smallint', nullable: true })
  sitting_talking: number | null;

  @Column({ type: 'smallint', nullable: true })
  sitting_after_lunch: number | null;

  @Column({ type: 'smallint', nullable: true })
  car_stopped_traffic: number | null;

  @Column({ type: 'int', nullable: true })
  total_score: number | null;

  @OneToOne(() => Questionnaire, (q) => q.epworth_score, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;
}
