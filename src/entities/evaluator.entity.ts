import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

// Evaluator entity now uses the 'users' table with role='evaluator'
// This maintains backward compatibility with existing code
@Entity('users')
export class Evaluator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'varchar', length: 50, default: 'evaluator' })
  role: string;

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  registration_number: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  specialty: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // Relations
  @OneToMany(() => Questionnaire, (questionnaire) => questionnaire.evaluator)
  questionnaires: Questionnaire[];
}
