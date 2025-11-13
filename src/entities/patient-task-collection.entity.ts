import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';
import { ActiveTaskDefinition } from './active-task-definition.entity';

@Entity('patient_task_collections')
export class PatientTaskCollection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  questionnaire_id: string;

  @Column({ type: 'int' })
  task_id: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completion_percentage: number;

  @Column({ type: 'jsonb', default: '[]' })
  completed_items: number[];

  @Column({ type: 'timestamp', nullable: true })
  collected_at: Date;

  @Column({ type: 'text', nullable: true })
  collector_notes: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Questionnaire, (q) => q.task_collections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;

  @ManyToOne(() => ActiveTaskDefinition, (t) => t.patient_tasks)
  @JoinColumn({ name: 'task_id' })
  active_task: ActiveTaskDefinition;
}
