import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import {
  FreelivingDiaryGap,
  FreelivingDiaryPayload,
  FreelivingDiaryStatus,
} from '../modules/freeliving/freeliving-diary.types';

@Entity('freeliving_diaries')
@Unique('uq_freeliving_diaries_patient_date', ['patient_id', 'diary_date'])
export class FreelivingDiary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  patient_id: string;

  @Column({ type: 'varchar', length: 128 })
  patient_cpf_hash: string;

  @Column({ type: 'date' })
  diary_date: string;

  @Column({ type: 'smallint' })
  protocol_day: number;

  @Column({ type: 'varchar', length: 20, default: 'rascunho' })
  status: FreelivingDiaryStatus;

  @Column({ type: 'jsonb', default: {} })
  payload: FreelivingDiaryPayload;

  @Column({ type: 'jsonb', default: [] })
  gaps: FreelivingDiaryGap[];

  @Column({ type: 'int', default: 0 })
  save_count: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  first_saved_at: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  last_saved_at: Date;

  @Column({ type: 'uuid', nullable: true })
  client_diary_id: string | null;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
}
