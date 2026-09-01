import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { FreelivingActionType } from './freeliving-action-type.entity';

@Entity('freeliving_collection_events')
export class FreelivingCollectionEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  patient_id: string;

  @Column({ type: 'varchar', length: 128 })
  patient_cpf_hash: string;

  @Column({ type: 'varchar', length: 64 })
  action_code: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  task_code: string | null;

  @Column({ type: 'timestamptz' })
  occurred_at: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  received_at: Date;

  @Column({ type: 'date' })
  collection_date: string;

  @Column({ type: 'uuid', nullable: true, unique: true })
  client_event_id: string | null;

  @Column({ type: 'varchar', length: 40, default: 'collection_app' })
  source: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  device_type: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  device_model: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  os_version: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  app_version: string | null;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => FreelivingActionType)
  @JoinColumn({ name: 'action_code' })
  action_type: FreelivingActionType;
}
