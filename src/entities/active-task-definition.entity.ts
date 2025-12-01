import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PatientTaskCollection } from './patient-task-collection.entity';
import { TaskChecklistItem } from './task-checklist-item.entity';

export enum TaskCategory {
  MOTOR = 'MOTOR',
  SPEECH = 'SPEECH',
  GAIT = 'GAIT',
  OTHER = 'OTHER',
}

@Entity('active_task_definitions')
export class ActiveTaskDefinition {
  @ApiProperty({ description: 'Task ID', example: 1, type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Unique task code identifier', example: 'TA1', maxLength: 20 })
  @Column({ type: 'varchar', length: 20, unique: true })
  task_code: string;

  @ApiProperty({ description: 'Task name', example: 'Mãos em repouso', maxLength: 255 })
  @Column({ type: 'varchar', length: 255 })
  task_name: string;

  @ApiPropertyOptional({ description: 'Task category', enum: TaskCategory, example: TaskCategory.MOTOR })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  task_category: TaskCategory;

  @ApiPropertyOptional({ description: 'Collection form type ID', example: 1, type: Number })
  @Column({ type: 'int', nullable: true })
  collection_form_type_id: number;

  @ApiPropertyOptional({
    description: 'Group number (1-5)',
    example: 1,
    type: Number,
    minimum: 1,
    maximum: 5,
  })
  @Column({ name: 'group', type: 'int', nullable: true })
  group: number;

  @ApiPropertyOptional({ description: 'Task description', example: 'Avaliação de tremor de repouso nas mãos...' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiPropertyOptional({ description: 'Task instructions for the patient', example: 'Posicione-se sentado confortavelmente...' })
  @Column({ type: 'text', nullable: true })
  instructions: string;

  @ApiPropertyOptional({ description: 'Active status', example: true, default: true, type: Boolean })
  @Column({ type: 'boolean', default: true })
  active: boolean;

  @OneToMany(() => PatientTaskCollection, (task) => task.active_task)
  patient_tasks: PatientTaskCollection[];

  @OneToMany(() => TaskChecklistItem, (item) => item.task, { cascade: true })
  checklist_items: TaskChecklistItem[];
}
