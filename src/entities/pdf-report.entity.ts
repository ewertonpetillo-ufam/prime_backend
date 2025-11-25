import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';

@Entity('pdf_reports')
export class PdfReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  questionnaire_id: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  report_type: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  file_path: string | null;

  @Column({ type: 'bytea', nullable: true, select: false })
  file_data: Buffer | null;

  @Column({ type: 'varchar', length: 255 })
  file_name: string;

  @Column({ type: 'int', nullable: true })
  file_size_bytes: number | null;

  @Column({ type: 'varchar', length: 100, default: 'application/pdf' })
  mime_type: string;

  @Column({ type: 'uuid', nullable: true })
  uploaded_by: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploaded_at: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ManyToOne(() => Questionnaire, (q) => q.pdf_reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionnaire_id' })
  questionnaire: Questionnaire;
}
