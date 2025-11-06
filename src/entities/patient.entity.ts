import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Questionnaire } from './questionnaire.entity';
import { GenderType } from './gender-type.entity';
import { EthnicityType } from './ethnicity-type.entity';
import { EducationLevel } from './education-level.entity';
import { MaritalStatusType } from './marital-status-type.entity';
import { IncomeRange } from './income-range.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 128, unique: true })
  cpf_hash: string;

  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'date' })
  date_of_birth: Date;

  @Column({ type: 'int', nullable: true })
  gender_id: number;

  @Column({ type: 'int', nullable: true })
  ethnicity_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true, default: 'Brasileiro' })
  nationality: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone_primary: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone_secondary: string;

  @Column({ type: 'int', nullable: true })
  education_level_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  education_other: string;

  @Column({ type: 'int', nullable: true })
  marital_status_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  occupation: string;

  @Column({ type: 'int', nullable: true })
  income_range_id: number;

  @Column({ type: 'boolean', default: false })
  is_current_smoker: boolean;

  @Column({ type: 'int', nullable: true })
  smoking_duration_years: number;

  @Column({ type: 'int', nullable: true })
  years_since_quit_smoking: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => GenderType, { eager: true })
  @JoinColumn({ name: 'gender_id' })
  gender: GenderType;

  @ManyToOne(() => EthnicityType, { eager: true })
  @JoinColumn({ name: 'ethnicity_id' })
  ethnicity: EthnicityType;

  @ManyToOne(() => EducationLevel, { eager: true })
  @JoinColumn({ name: 'education_level_id' })
  education_level: EducationLevel;

  @ManyToOne(() => MaritalStatusType, { eager: true })
  @JoinColumn({ name: 'marital_status_id' })
  marital_status: MaritalStatusType;

  @ManyToOne(() => IncomeRange, { eager: true })
  @JoinColumn({ name: 'income_range_id' })
  income_range: IncomeRange;

  @OneToMany(() => Questionnaire, (questionnaire) => questionnaire.patient)
  questionnaires: Questionnaire[];
}
