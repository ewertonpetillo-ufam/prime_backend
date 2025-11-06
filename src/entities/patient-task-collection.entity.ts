import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';
import { ActiveTaskDefinition } from './active-task-definition.entity';

@Entity('patient_task_collections')
export class PatientTaskCollection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  questionnaire_id: string;

  @Column({ type: 'int' })
  active_task_id: number;

  @Column({ type: 'timestamptz' })
  completed_at: Date;

  @Column({ type: 'int', nullable: true })
  progress_percent: number;

  @ManyToOne(() => Questionnaire, (q) => q.task_collections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;

  @ManyToOne(() => ActiveTaskDefinition, (t) => t.patient_tasks)
  @JoinColumn({ name: 'active_task_id' })
  active_task: ActiveTaskDefinition;
}
