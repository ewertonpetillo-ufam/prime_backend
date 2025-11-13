import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ActiveTaskDefinition } from './active-task-definition.entity';

@Entity('task_checklist_items')
@Index(['task_id', 'item_order'], { unique: true })
export class TaskChecklistItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  task_id: number;

  @Column({ type: 'int' })
  item_order: number;

  @Column({ type: 'varchar', length: 500 })
  item_description: string;

  @ManyToOne(() => ActiveTaskDefinition, (task) => task.checklist_items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task: ActiveTaskDefinition;
}

