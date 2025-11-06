import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

@Entity('evaluators')
export class Evaluator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  registration_number: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  specialty: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  // Relations
  @OneToMany(() => Questionnaire, (questionnaire) => questionnaire.evaluator)
  questionnaires: Questionnaire[];
}
