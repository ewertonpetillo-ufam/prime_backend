import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SamsungSyncRunItem } from './samsung-sync-run-item.entity';

export enum SamsungSyncRunStatus {
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('samsung_sync_runs')
export class SamsungSyncRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, default: SamsungSyncRunStatus.RUNNING })
  status: SamsungSyncRunStatus;

  @Column({ type: 'uuid', nullable: true })
  triggered_by_user_id: string | null;

  @Column({ type: 'varchar', length: 30, default: 'manual' })
  trigger_type: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  started_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  finished_at: Date | null;

  @Column({ type: 'int', default: 0 })
  total_patients: number;

  @Column({ type: 'int', default: 0 })
  synced_patients: number;

  @Column({ type: 'int', default: 0 })
  errored_patients: number;

  @Column({ type: 'int', default: 0 })
  uploaded_files: number;

  @Column({ type: 'int', default: 0 })
  skipped_files: number;

  @Column({ type: 'int', default: 0 })
  deleted_files: number;

  @Column({ type: 'int', default: 0 })
  error_files: number;

  @Column({ type: 'jsonb', default: '{}' })
  summary: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  error_message: string | null;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => SamsungSyncRunItem, (item) => item.run)
  items: SamsungSyncRunItem[];
}
