import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

@Entity('pdf_reports')
export class PdfReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  questionnaire_id: string;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @ManyToOne(() => Questionnaire, (q) => q.pdf_reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;
}
