import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Evaluator } from './evaluator.entity';
import { AnthropometricData } from './anthropometric-data.entity';
import { ClinicalAssessment } from './clinical-assessment.entity';
import { PatientMedication } from './patient-medication.entity';
import { Updrs3Score } from './updrs3-score.entity';
import { MeemScore } from './meem-score.entity';
import { UdysrsScore } from './udysrs-score.entity';
import { NmsScore } from './nms-score.entity';
import { NmfScore } from './nmf-score.entity';
import { FogqScore } from './fogq-score.entity';
import { StopbangScore } from './stopbang-score.entity';
import { EpworthScore } from './epworth-score.entity';
import { Pdss1Score } from './pdss1-score.entity';
import { RbdsqScore } from './rbdsq-score.entity';
import { PatientTaskCollection } from './patient-task-collection.entity';
import { PdfReport } from './pdf-report.entity';
import { ClinicalImpression } from './clinical-impression.entity';
import { BinaryCollection } from './binary-collection.entity';

export enum QuestionnaireStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('questionnaires')
export class Questionnaire {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  patient_id: string;

  @Column({ type: 'uuid' })
  evaluator_id: string;

  @Column({ type: 'date' })
  collection_date: Date;

  @Column({
    type: 'enum',
    enum: QuestionnaireStatus,
    default: QuestionnaireStatus.DRAFT,
  })
  status: QuestionnaireStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Patient, (patient) => patient.questionnaires, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Evaluator, (evaluator) => evaluator.questionnaires, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'evaluator_id' })
  evaluator: Evaluator;

  @OneToOne(
    () => AnthropometricData,
    (anthropometric) => anthropometric.questionnaire,
    { cascade: true },
  )
  anthropometric_data: AnthropometricData;

  @OneToOne(
    () => ClinicalAssessment,
    (clinical) => clinical.questionnaire,
    { cascade: true },
  )
  clinical_assessment: ClinicalAssessment;

  @OneToMany(
    () => PatientMedication,
    (medication) => medication.questionnaire,
    { cascade: true },
  )
  medications: PatientMedication[];

  @OneToOne(() => Updrs3Score, (updrs3) => updrs3.questionnaire, {
    cascade: true,
  })
  updrs3_score: Updrs3Score;

  @OneToOne(() => MeemScore, (meem) => meem.questionnaire, { cascade: true })
  meem_score: MeemScore;

  @OneToOne(() => UdysrsScore, (udysrs) => udysrs.questionnaire, {
    cascade: true,
  })
  udysrs_score: UdysrsScore;

  @OneToOne(() => NmsScore, (nms) => nms.questionnaire, { cascade: true })
  nms_score: NmsScore;

  @OneToOne(() => NmfScore, (nmf) => nmf.questionnaire, { cascade: true })
  nmf_score: NmfScore;

  @OneToOne(() => FogqScore, (fogq) => fogq.questionnaire, { cascade: true })
  fogq_score: FogqScore;

  @OneToOne(() => StopbangScore, (stopbang) => stopbang.questionnaire, {
    cascade: true,
  })
  stopbang_score: StopbangScore;

  @OneToOne(() => EpworthScore, (epworth) => epworth.questionnaire, {
    cascade: true,
  })
  epworth_score: EpworthScore;

  @OneToOne(() => Pdss1Score, (pdss1) => pdss1.questionnaire, {
    cascade: true,
  })
  pdss1_score: Pdss1Score;

  @OneToOne(() => RbdsqScore, (rbdsq) => rbdsq.questionnaire, {
    cascade: true,
  })
  rbdsq_score: RbdsqScore;

  @OneToMany(() => PatientTaskCollection, (task) => task.questionnaire, {
    cascade: true,
  })
  task_collections: PatientTaskCollection[];

  @OneToMany(() => PdfReport, (pdf) => pdf.questionnaire, { cascade: true })
  pdf_reports: PdfReport[];

  @OneToOne(
    () => ClinicalImpression,
    (impression) => impression.questionnaire,
    { cascade: true },
  )
  clinical_impression: ClinicalImpression;

  @OneToMany(() => BinaryCollection, (binary) => binary.questionnaire, {
    cascade: true,
  })
  binary_collections: BinaryCollection[];
}
