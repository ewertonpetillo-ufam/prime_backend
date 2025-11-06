import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Questionnaire } from './questionnaire.entity';
import { ActiveTaskDefinition } from './active-task-definition.entity';

export enum CollectionType {
  MOTOR = 'MOTOR',
  GAIT = 'GAIT',
  TREMOR = 'TREMOR',
  SPEECH = 'SPEECH',
  OTHER = 'OTHER',
}

export enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
}

@Entity('binary_collections')
export class BinaryCollection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 128 })
  patient_cpf_hash: string;

  @Column({ type: 'int' })
  repetitions_count: number;

  @Column({ type: 'int', nullable: true })
  task_id: number;

  @Column({ type: 'uuid', nullable: true })
  questionnaire_id: string;

  @Column({ type: 'bytea' })
  csv_data: Buffer;

  @Column({ type: 'int' })
  file_size_bytes: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  file_checksum: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  collection_type: CollectionType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  device_type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  device_serial: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  sampling_rate_hz: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  collected_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploaded_at: Date;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: any;

  @Column({
    type: 'varchar',
    length: 20,
    default: ProcessingStatus.PENDING,
  })
  processing_status: ProcessingStatus;

  @Column({ type: 'text', nullable: true })
  processing_error: string;

  // Relations
  @ManyToOne(() => Questionnaire, (questionnaire) => questionnaire.binary_collections, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;

  @ManyToOne(() => ActiveTaskDefinition)
  @JoinColumn({ name: 'task_id' })
  active_task: ActiveTaskDefinition;
}
