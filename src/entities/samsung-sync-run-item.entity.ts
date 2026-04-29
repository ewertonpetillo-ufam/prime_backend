import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SamsungSyncRun } from './samsung-sync-run.entity';

export enum SamsungSyncItemAction {
  UPLOAD = 'upload',
  SKIP = 'skip',
  DELETE = 'delete',
  ERROR = 'error',
  METADATA = 'metadata',
}

@Entity('samsung_sync_run_items')
export class SamsungSyncRunItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  run_id: string;

  @Column({ type: 'uuid', nullable: true })
  patient_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  binary_collection_id: string | null;

  @Column({ type: 'varchar', length: 20 })
  action: SamsungSyncItemAction;

  @Column({ type: 'varchar', length: 120 })
  artifact_repo: string;

  @Column({ type: 'text' })
  artifact_path: string;

  @Column({ type: 'text', nullable: true })
  sha256: string | null;

  @Column({ type: 'boolean', default: false })
  uploaded: boolean;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ type: 'text', nullable: true })
  error_message: string | null;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => SamsungSyncRun, (run) => run.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'run_id' })
  run: SamsungSyncRun;
}
