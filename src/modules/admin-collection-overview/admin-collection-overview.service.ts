import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Questionnaire } from '../../entities/questionnaire.entity';
import { BinaryCollection } from '../../entities/binary-collection.entity';
import { ActiveTaskDefinition } from '../../entities/active-task-definition.entity';
import { ClinicalAssessment } from '../../entities/clinical-assessment.entity';
import { HoehnYahrScale } from '../../entities/hoehn-yahr-scale.entity';
import { PdfReport } from '../../entities/pdf-report.entity';
import {
  EXPECTED_BINARY_FILES_TOTAL,
  CollectionProtocolStage,
  expectedFilesForTaskCode,
  sumExpectedForTaskCodes,
  taskCodesInProtocolStage,
} from './expected-binary-files.constants';

const DEFAULT_LIMIT = 200;
const AT_RISK_DAYS = 7;

const PROTOCOL_STAGES: CollectionProtocolStage[] = [
  'in_clinic',
  'sleep',
  'free_living',
];

/** Identificadores públicos (paciente) excluídos do painel de coleta e da matriz. */
const EXCLUDED_COLLECTION_PUBLIC_IDS = ['P000', 'P00'] as const;

export type TaskColumnDto = {
  task_code: string;
  task_name: string;
  expectedFiles: number;
};

export type MatrixRowDto = {
  questionnaireId: string;
  patientLabel: string;
  patientName: string;
  status: string;
  countsByTask: Record<string, number>;
  totalFiles: number;
  expectedTotal: number;
  completionPercent: number;
};

export type ClinicalStratificationKpis = {
  pacientesPrecoces: number;
  pacientesSaudaveis: number;
  pacientesAvancados: number;
  pacientesSemClassificacaoClinica: number;
};

export type GenderKpis = {
  pacientesHomens: number;
  pacientesMulheres: number;
};

export type DemographicsBalanceRow = {
  grupo: 'precoce' | 'saudavel' | 'avancado' | 'sem_classificacao';
  grupoLabel: string;
  faixaEtaria: string;
  homens: number;
  mulheres: number;
  total: number;
};

export type DemographicsBalanceKpis = {
  faixasEtarias: string[];
  linhas: DemographicsBalanceRow[];
};

export type ReportPatientRowDto = {
  questionnaireId: string;
  patientLabel: string;
  patientName: string;
  sex: string;
  age: number | null;
  patientGroup: DemographicsBalanceRow['grupo'];
  isAdvanced: boolean;
  sleepTestRecommended: boolean;
  sleepTestDone: boolean;
  sleepTestUploadedAt: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  weightKg: number | null;
  bmi: number | null;
  isCurrentSmoker: boolean;
  usesMedication: boolean;
  medications: string | null;
};

@Injectable()
export class AdminCollectionOverviewService {
  constructor(
    @InjectRepository(Questionnaire)
    private readonly questionnairesRepo: Repository<Questionnaire>,
    @InjectRepository(BinaryCollection)
    private readonly binaryRepo: Repository<BinaryCollection>,
    @InjectRepository(ActiveTaskDefinition)
    private readonly tasksRepo: Repository<ActiveTaskDefinition>,
    @InjectRepository(ClinicalAssessment)
    private readonly clinicalRepo: Repository<ClinicalAssessment>,
    @InjectRepository(PdfReport)
    private readonly pdfReportRepo: Repository<PdfReport>,
  ) {}

  private parseStatuses(statusesParam?: string): string[] {
    if (!statusesParam?.trim()) {
      return ['in_progress'];
    }
    return statusesParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private sortTaskCodes(codes: string[]): string[] {
    return [...codes].sort((a, b) => {
      const na = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const nb = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return na - nb;
    });
  }

  async getTaskColumns(): Promise<TaskColumnDto[]> {
    const tasks = await this.tasksRepo.find({
      where: { active: true },
      order: { task_code: 'ASC' },
    });
    const sorted = this.sortTaskCodes(tasks.map((t) => t.task_code));
    const byCode = new Map(tasks.map((t) => [t.task_code, t]));
    return sorted.map((code) => {
      const t = byCode.get(code)!;
      return {
        task_code: t.task_code,
        task_name: t.task_name,
        expectedFiles: expectedFilesForTaskCode(t.task_code),
      };
    });
  }

  private async loadScopeAndCounts(
    statuses: string[],
    limit: number,
  ): Promise<{
    questionnaires: Questionnaire[];
    countsRows: { questionnaire_id: string; task_id: number; cnt: string }[];
    lastUploadRows: { questionnaire_id: string; last_upload: Date | null }[];
    taskIdToCode: Map<number, string>;
  }> {
    const excludedUpper = [...EXCLUDED_COLLECTION_PUBLIC_IDS].map((id) =>
      id.toUpperCase(),
    );
    const qb = this.questionnairesRepo
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.patient', 'patient')
      .where('q.status IN (:...statuses)', { statuses })
      .andWhere(
        '(patient.public_identifier IS NULL OR UPPER(TRIM(patient.public_identifier)) NOT IN (:...excludedPids))',
        { excludedPids: excludedUpper },
      )
      .orderBy('q.updated_at', 'DESC')
      .take(Math.min(Math.max(limit, 1), 500));

    const questionnaires = await qb.getMany();

    const allTasks = await this.tasksRepo.find({ where: { active: true } });
    const taskIdToCode = new Map(
      allTasks.map((t) => [t.id, t.task_code] as const),
    );

    if (questionnaires.length === 0) {
      return {
        questionnaires: [],
        countsRows: [],
        lastUploadRows: [],
        taskIdToCode,
      };
    }

    const ids = questionnaires.map((q) => q.id);

    const countsRaw = await this.binaryRepo.manager.query(
      `
      SELECT q.id AS questionnaire_id,
             bc.task_id,
             COUNT(*)::text AS cnt,
             MAX(bc.uploaded_at) AS last_uploaded_at
      FROM questionnaires q
      INNER JOIN patients p ON p.id = q.patient_id
      INNER JOIN binary_collections bc ON (
        bc.questionnaire_id = q.id OR bc.patient_cpf_hash = p.cpf_hash
      )
      WHERE q.id = ANY($1::uuid[])
        AND bc.task_id IS NOT NULL
      GROUP BY q.id, bc.task_id
      `,
      [ids],
    );

    const lastUploadRaw = await this.binaryRepo.manager.query(
      `
      SELECT q.id AS questionnaire_id, MAX(bc.uploaded_at) AS last_upload
      FROM questionnaires q
      INNER JOIN patients p ON p.id = q.patient_id
      LEFT JOIN binary_collections bc ON (
        bc.questionnaire_id = q.id OR bc.patient_cpf_hash = p.cpf_hash
      )
      WHERE q.id = ANY($1::uuid[])
      GROUP BY q.id
      `,
      [ids],
    );

    return {
      questionnaires,
      countsRows: countsRaw,
      lastUploadRows: lastUploadRaw,
      taskIdToCode,
    };
  }

  private buildCountsByQuestionnaire(
    countsRows: {
      questionnaire_id: string;
      task_id: number | string;
      cnt: string;
      last_uploaded_at?: Date | string | null;
    }[],
    taskIdToCode: Map<number, string>,
  ): Map<string, Record<string, number>> {
    const map = new Map<string, Record<string, number>>();
    for (const row of countsRows) {
      const code = taskIdToCode.get(Number(row.task_id));
      if (!code) continue;
      const qid = String(row.questionnaire_id);
      if (!map.has(qid)) map.set(qid, {});
      const rec = map.get(qid)!;
      rec[code] = (rec[code] || 0) + parseInt(row.cnt, 10);
    }
    return map;
  }

  /** Data ISO do último upload por questionário para um task_code (ex.: TA13). */
  private buildTaskUploadAtByQuestionnaire(
    countsRows: {
      questionnaire_id: string;
      task_id: number | string;
      last_uploaded_at?: Date | string | null;
    }[],
    taskIdToCode: Map<number, string>,
    taskCode: string,
  ): Map<string, string> {
    const map = new Map<string, string>();
    for (const row of countsRows) {
      const code = taskIdToCode.get(Number(row.task_id));
      if (code !== taskCode) continue;
      const iso = this.toIsoDateTime(row.last_uploaded_at);
      if (!iso) continue;
      const qid = String(row.questionnaire_id);
      const prev = map.get(qid);
      if (!prev || iso > prev) {
        map.set(qid, iso);
      }
    }
    return map;
  }

  private toIsoDateTime(value: Date | string | null | undefined): string | null {
    if (value == null) return null;
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  }

  /** Um questionário por paciente: primeiro na lista já ordenada por `updated_at` DESC. */
  private dedupeLatestQuestionnairePerPatient(
    questionnaires: Questionnaire[],
  ): Questionnaire[] {
    const seen = new Set<string>();
    const out: Questionnaire[] = [];
    for (const q of questionnaires) {
      if (seen.has(q.patient_id)) continue;
      seen.add(q.patient_id);
      out.push(q);
    }
    return out;
  }

  /** Mesma aproximação que o carregamento do formulário (questionnaires.service). */
  private approximateDiseaseYears(
    dateOfBirth: Date | undefined,
    ageAtOnset: number | null | undefined,
  ): number | null {
    if (!dateOfBirth || ageAtOnset == null || Number.isNaN(ageAtOnset)) {
      return null;
    }
    const refYear = new Date().getFullYear();
    const birthYear = new Date(dateOfBirth).getFullYear();
    const d = refYear - birthYear - ageAtOnset;
    return Number.isFinite(d) ? d : null;
  }

  private async computeClinicalStratificationKpis(
    questionnaires: Questionnaire[],
  ): Promise<ClinicalStratificationKpis> {
    const empty: ClinicalStratificationKpis = {
      pacientesPrecoces: 0,
      pacientesSaudaveis: 0,
      pacientesAvancados: 0,
      pacientesSemClassificacaoClinica: 0,
    };
    if (questionnaires.length === 0) return empty;

    const onePerPatient = this.dedupeLatestQuestionnairePerPatient(questionnaires);
    const qids = onePerPatient.map((q) => q.id);

    const raw = await this.clinicalRepo
      .createQueryBuilder('ca')
      .select('ca.questionnaire_id', 'questionnaire_id')
      .addSelect('ca.age_at_onset', 'age_at_onset')
      .addSelect('hy.stage', 'stage')
      .leftJoin(HoehnYahrScale, 'hy', 'hy.id = ca.hoehn_yahr_stage_id')
      .where('ca.questionnaire_id IN (:...qids)', { qids })
      .getRawMany();

    const byQid = new Map<
      string,
      { age_at_onset: number | null; stage: string | number | null }
    >();
    for (const row of raw) {
      const qid = String((row as { questionnaire_id: string }).questionnaire_id);
      const ageRaw = (row as { age_at_onset: unknown }).age_at_onset;
      const stageRaw = (row as { stage: unknown }).stage;
      byQid.set(qid, {
        age_at_onset:
          ageRaw !== null && ageRaw !== undefined && !Number.isNaN(Number(ageRaw))
            ? Number(ageRaw)
            : null,
        stage: stageRaw as string | number | null,
      });
    }

    let pacientesPrecoces = 0;
    let pacientesSaudaveis = 0;
    let pacientesAvancados = 0;
    let pacientesSemClassificacaoClinica = 0;

    for (const q of onePerPatient) {
      // Grupo de controle: contagem em «Saudável» (is_healthy_control no questionário).
      if (q.is_healthy_control === true) {
        pacientesSaudaveis++;
        continue;
      }

      const row = byQid.get(q.id);
      const stageVal = row?.stage;
      const hyNum =
        stageVal === null || stageVal === undefined
          ? null
          : Number.parseFloat(String(stageVal));
      const hy = hyNum !== null && Number.isFinite(hyNum) ? hyNum : null;

      const D = this.approximateDiseaseYears(
        q.patient?.date_of_birth,
        row?.age_at_onset ?? null,
      );

      if (D === null || hy === null) {
        pacientesSemClassificacaoClinica++;
        continue;
      }
      // Avançado: tempo de doença (anos) >= 5. Precoce: < 5 anos e Hoehn-Yahr <= 3.
      if (D >= 5) {
        pacientesAvancados++;
      } else if (D < 5 && hy <= 3) {
        pacientesPrecoces++;
      } else {
        // Ex.: doença < 5 anos com HY > 3 — fora dos cortes operacionais acima.
        pacientesSemClassificacaoClinica++;
      }
    }

    return {
      pacientesPrecoces,
      pacientesSaudaveis,
      pacientesAvancados,
      pacientesSemClassificacaoClinica,
    };
  }

  private async computeGenderKpis(
    questionnaires: Questionnaire[],
  ): Promise<GenderKpis> {
    if (questionnaires.length === 0) {
      return { pacientesHomens: 0, pacientesMulheres: 0 };
    }

    const onePerPatient = this.dedupeLatestQuestionnairePerPatient(questionnaires);
    const qids = onePerPatient.map((q) => q.id);
    if (qids.length === 0) {
      return { pacientesHomens: 0, pacientesMulheres: 0 };
    }

    const raw = await this.questionnairesRepo.manager.query(
      `
      SELECT
        COALESCE(gt.code, '') AS gender_code,
        COUNT(*)::int AS total
      FROM questionnaires q
      INNER JOIN patients p ON p.id = q.patient_id
      LEFT JOIN gender_types gt ON gt.id = p.gender_id
      WHERE q.id = ANY($1::uuid[])
      GROUP BY COALESCE(gt.code, '')
      `,
      [qids],
    );

    let pacientesHomens = 0;
    let pacientesMulheres = 0;
    for (const row of raw as { gender_code: string; total: string | number }[]) {
      const code = String(row.gender_code || '').trim().toUpperCase();
      const total = Number(row.total || 0);
      if (code === 'M') pacientesHomens += total;
      if (code === 'F') pacientesMulheres += total;
    }

    return { pacientesHomens, pacientesMulheres };
  }

  private computeAgeYears(dateOfBirth: Date | undefined): number | null {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age -= 1;
    }
    return Number.isFinite(age) ? age : null;
  }

  private ageBandLabel(age: number | null): string {
    if (age == null || age < 0) return 'Sem idade';
    if (age < 50) return '18–49';
    if (age < 60) return '50–59';
    if (age < 70) return '60–69';
    if (age < 80) return '70–79';
    return '80+';
  }

  private classifyPatientGroup(
    q: Questionnaire,
    clinicalRow: { age_at_onset: number | null; stage: string | number | null } | undefined,
  ): DemographicsBalanceRow['grupo'] {
    if (q.is_healthy_control === true) return 'saudavel';

    const stageVal = clinicalRow?.stage;
    const hyNum =
      stageVal === null || stageVal === undefined
        ? null
        : Number.parseFloat(String(stageVal));
    const hy = hyNum !== null && Number.isFinite(hyNum) ? hyNum : null;

    const D = this.approximateDiseaseYears(
      q.patient?.date_of_birth,
      clinicalRow?.age_at_onset ?? null,
    );

    if (D === null || hy === null) return 'sem_classificacao';
    if (D >= 5) return 'avancado';
    if (D < 5 && hy <= 3) return 'precoce';
    return 'sem_classificacao';
  }

  private async computeDemographicsBalanceKpis(
    questionnaires: Questionnaire[],
  ): Promise<DemographicsBalanceKpis> {
    const faixasEtarias = ['18–49', '50–59', '60–69', '70–79', '80+', 'Sem idade'];
    const empty: DemographicsBalanceKpis = { faixasEtarias, linhas: [] };
    if (questionnaires.length === 0) return empty;

    const onePerPatient = this.dedupeLatestQuestionnairePerPatient(questionnaires);
    const qids = onePerPatient.map((q) => q.id);
    if (qids.length === 0) return empty;

    const raw = await this.clinicalRepo
      .createQueryBuilder('ca')
      .select('ca.questionnaire_id', 'questionnaire_id')
      .addSelect('ca.age_at_onset', 'age_at_onset')
      .addSelect('hy.stage', 'stage')
      .leftJoin(HoehnYahrScale, 'hy', 'hy.id = ca.hoehn_yahr_stage_id')
      .where('ca.questionnaire_id IN (:...qids)', { qids })
      .getRawMany();

    const byQid = new Map<
      string,
      { age_at_onset: number | null; stage: string | number | null }
    >();
    for (const row of raw) {
      const qid = String((row as { questionnaire_id: string }).questionnaire_id);
      const ageRaw = (row as { age_at_onset: unknown }).age_at_onset;
      const stageRaw = (row as { stage: unknown }).stage;
      byQid.set(qid, {
        age_at_onset:
          ageRaw !== null && ageRaw !== undefined && !Number.isNaN(Number(ageRaw))
            ? Number(ageRaw)
            : null,
        stage: stageRaw as string | number | null,
      });
    }

    const genderRaw = await this.questionnairesRepo.manager.query(
      `
      SELECT
        q.id AS questionnaire_id,
        COALESCE(gt.code, '') AS gender_code,
        p.date_of_birth AS date_of_birth
      FROM questionnaires q
      INNER JOIN patients p ON p.id = q.patient_id
      LEFT JOIN gender_types gt ON gt.id = p.gender_id
      WHERE q.id = ANY($1::uuid[])
      `,
      [qids],
    );

    const genderByQid = new Map<
      string,
      { gender_code: string; date_of_birth: Date | string | null }
    >();
    for (const row of genderRaw as {
      questionnaire_id: string;
      gender_code: string;
      date_of_birth: Date | string | null;
    }[]) {
      genderByQid.set(String(row.questionnaire_id), {
        gender_code: String(row.gender_code || '').trim().toUpperCase(),
        date_of_birth: row.date_of_birth,
      });
    }

    const grupoLabels: Record<DemographicsBalanceRow['grupo'], string> = {
      precoce: 'Precoce (DP)',
      saudavel: 'Saudável (controle)',
      avancado: 'Avançado (DP)',
      sem_classificacao: 'Sem classificação',
    };

    const counts = new Map<string, DemographicsBalanceRow>();

    for (const q of onePerPatient) {
      const grupo = this.classifyPatientGroup(q, byQid.get(q.id));
      const gRow = genderByQid.get(q.id);
      const age = this.computeAgeYears(
        gRow?.date_of_birth
          ? new Date(gRow.date_of_birth as string | Date)
          : q.patient?.date_of_birth,
      );
      const faixaEtaria = this.ageBandLabel(age);
      const key = `${grupo}|${faixaEtaria}`;
      const genderCode = gRow?.gender_code || '';
      const isMale = genderCode === 'M';
      const isFemale = genderCode === 'F';

      let row = counts.get(key);
      if (!row) {
        row = {
          grupo,
          grupoLabel: grupoLabels[grupo],
          faixaEtaria,
          homens: 0,
          mulheres: 0,
          total: 0,
        };
        counts.set(key, row);
      }
      if (isMale) row.homens += 1;
      else if (isFemale) row.mulheres += 1;
      row.total += 1;
    }

    const grupoOrder: DemographicsBalanceRow['grupo'][] = [
      'precoce',
      'avancado',
      'saudavel',
      'sem_classificacao',
    ];
    const linhas = [...counts.values()].sort((a, b) => {
      const ga = grupoOrder.indexOf(a.grupo);
      const gb = grupoOrder.indexOf(b.grupo);
      if (ga !== gb) return ga - gb;
      const fa = faixasEtarias.indexOf(a.faixaEtaria);
      const fb = faixasEtarias.indexOf(b.faixaEtaria);
      return fa - fb;
    });

    return { faixasEtarias, linhas };
  }

  private patientLabel(q: Questionnaire): string {
    const pid = q.patient?.public_identifier?.trim();
    if (pid) return pid;
    const name = q.patient?.full_name?.trim();
    if (name) {
      const parts = name.split(/\s+/).filter(Boolean);
      if (parts.length)
        return (
          parts[0] +
          (parts[1] ? ` ${parts[parts.length - 1][0]}.` : '')
        );
    }
    return q.id.slice(0, 8);
  }

  private computeProtocolStageTotals(
    matrixRows: MatrixRowDto[],
    taskCodes: string[],
  ): Record<
    CollectionProtocolStage,
    { ficheiros: number; meta: number; progressoPercent: number }
  > {
    const n = matrixRows.length;
    const out: Record<
      CollectionProtocolStage,
      { ficheiros: number; meta: number; progressoPercent: number }
    > = {
      in_clinic: { ficheiros: 0, meta: 0, progressoPercent: 0 },
      sleep: { ficheiros: 0, meta: 0, progressoPercent: 0 },
      free_living: { ficheiros: 0, meta: 0, progressoPercent: 0 },
    };

    for (const stage of PROTOCOL_STAGES) {
      const codes = taskCodesInProtocolStage(stage, taskCodes);
      const metaPerPatient = sumExpectedForTaskCodes(codes);
      out[stage].meta = n * metaPerPatient;
      let fich = 0;
      for (const row of matrixRows) {
        for (const code of codes) {
          fich += row.countsByTask[code] ?? 0;
        }
      }
      out[stage].ficheiros = fich;
      out[stage].progressoPercent =
        out[stage].meta > 0
          ? Math.min(
              100,
              Math.round((fich / out[stage].meta) * 1000) / 10,
            )
          : 0;
    }

    return out;
  }

  private buildMatrixRows(
    questionnaires: Questionnaire[],
    byQ: Map<string, Record<string, number>>,
    lastByQ: Map<string, Date | null | undefined>,
    expectedRowTotal: number,
    now: number,
    atRiskMs: number,
  ): {
    matrixRows: MatrixRowDto[];
    summaryQuestionnaires: {
      questionnaireId: string;
      patientLabel: string;
      patientName: string;
      status: string;
      totalFiles: number;
      expectedTotal: number;
      completionPercent: number;
      lastUploadAt: string | null;
      atRisk: boolean;
    }[];
  } {
    const matrixRows: MatrixRowDto[] = [];
    const summaryQuestionnaires: {
      questionnaireId: string;
      patientLabel: string;
      patientName: string;
      status: string;
      totalFiles: number;
      expectedTotal: number;
      completionPercent: number;
      lastUploadAt: string | null;
      atRisk: boolean;
    }[] = [];

    for (const q of questionnaires) {
      const counts = byQ.get(String(q.id)) || byQ.get(q.id) || {};
      const totalFiles = Object.values(counts).reduce((a, b) => a + b, 0);
      const completionPercent =
        expectedRowTotal > 0
          ? Math.min(
              100,
              Math.round((totalFiles / expectedRowTotal) * 1000) / 10,
            )
          : 0;
      const last = lastByQ.get(q.id);
      const lastUploadAt = last ? new Date(last).toISOString() : null;
      const atRisk =
        q.status === 'in_progress' &&
        (!last || now - new Date(last).getTime() > atRiskMs);

      matrixRows.push({
        questionnaireId: q.id,
        patientLabel: this.patientLabel(q),
        patientName: q.patient?.full_name || '',
        status: q.status,
        countsByTask: counts,
        totalFiles,
        expectedTotal: expectedRowTotal,
        completionPercent,
      });

      summaryQuestionnaires.push({
        questionnaireId: q.id,
        patientLabel: this.patientLabel(q),
        patientName: q.patient?.full_name || '',
        status: q.status,
        totalFiles,
        expectedTotal: expectedRowTotal,
        completionPercent,
        lastUploadAt,
        atRisk,
      });
    }

    return { matrixRows, summaryQuestionnaires };
  }

  async getMatrix(params: {
    statuses?: string;
    limit?: number;
  }): Promise<{
    taskColumns: TaskColumnDto[];
    rows: MatrixRowDto[];
    meta: {
      limit: number;
      statuses: string[];
      generatedAt: string;
    };
  }> {
    const statuses = this.parseStatuses(params.statuses);
    const limit = params.limit ?? DEFAULT_LIMIT;
    const taskColumns = await this.getTaskColumns();
    const taskCodes = taskColumns.map((c) => c.task_code);
    const expectedRowTotal = sumExpectedForTaskCodes(taskCodes);

    const { questionnaires, countsRows, lastUploadRows, taskIdToCode } =
      await this.loadScopeAndCounts(statuses, limit);
    const byQ = this.buildCountsByQuestionnaire(countsRows, taskIdToCode);
    const lastByQ = new Map(
      lastUploadRows.map((r) => [
        r.questionnaire_id,
        r.last_upload ? new Date(r.last_upload) : null,
      ]),
    );

    const now = Date.now();
    const atRiskMs = AT_RISK_DAYS * 24 * 60 * 60 * 1000;
    const { matrixRows } = this.buildMatrixRows(
      questionnaires,
      byQ,
      lastByQ,
      expectedRowTotal,
      now,
      atRiskMs,
    );

    return {
      taskColumns,
      rows: matrixRows,
      meta: {
        limit,
        statuses,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  async getSummary(params: { statuses?: string; limit?: number }): Promise<{
    kpis: {
      protocolosNoAmbito: number;
      pacientesDistintos: number;
      ficheirosTotais: number;
      progressoMedioPercent: number;
      metaGlobalFicheiros: number;
      ficheirosProtocoloInClinic: number;
      metaProtocoloInClinic: number;
      progressoProtocoloInClinicPercent: number;
      ficheirosProtocoloSleep: number;
      metaProtocoloSleep: number;
      progressoProtocoloSleepPercent: number;
      ficheirosProtocoloFreeLiving: number;
      metaProtocoloFreeLiving: number;
      progressoProtocoloFreeLivingPercent: number;
      armazenamentoColetasBytes: number;
      armazenamentoRelatoriosMinioBytes: number;
      armazenamentoTotalBytes: number;
    } & ClinicalStratificationKpis &
      GenderKpis &
      DemographicsBalanceKpis;
    filesByTask: { task_code: string; task_name: string; count: number }[];
    questionnaires: {
      questionnaireId: string;
      patientLabel: string;
      patientName: string;
      status: string;
      totalFiles: number;
      expectedTotal: number;
      completionPercent: number;
      lastUploadAt: string | null;
      atRisk: boolean;
    }[];
    meta: {
      limit: number;
      statuses: string[];
      expectedBinaryFilesTotal: number;
      atRiskDaysWithoutUpload: number;
      generatedAt: string;
    };
  }> {
    const statuses = this.parseStatuses(params.statuses);
    const limit = params.limit ?? DEFAULT_LIMIT;
    const taskColumns = await this.getTaskColumns();
    const taskCodes = taskColumns.map((c) => c.task_code);
    const expectedRowTotal = sumExpectedForTaskCodes(taskCodes);

    const { questionnaires, countsRows, lastUploadRows, taskIdToCode } =
      await this.loadScopeAndCounts(statuses, limit);
    const byQ = this.buildCountsByQuestionnaire(countsRows, taskIdToCode);
    const lastByQ = new Map(
      lastUploadRows.map((r) => [
        r.questionnaire_id,
        r.last_upload ? new Date(r.last_upload) : null,
      ]),
    );

    const now = Date.now();
    const atRiskMs = AT_RISK_DAYS * 24 * 60 * 60 * 1000;
    const { matrixRows, summaryQuestionnaires } = this.buildMatrixRows(
      questionnaires,
      byQ,
      lastByQ,
      expectedRowTotal,
      now,
      atRiskMs,
    );

    const distinctPatientIds = new Set(questionnaires.map((q) => q.patient_id));
    const ficheirosTotais = matrixRows.reduce((s, r) => s + r.totalFiles, 0);
    const progressoMedioPercent =
      matrixRows.length > 0
        ? Math.min(
            100,
            Math.round(
              (matrixRows.reduce((s, r) => s + r.completionPercent, 0) /
                matrixRows.length) *
                10,
            ) / 10,
          )
        : 0;

    const questionnaireIds = questionnaires.map((q) => q.id);
    const armazenamentoColetasBytes =
      questionnaireIds.length > 0
        ? Number(
            (
              await this.binaryRepo.manager.query(
                `
                SELECT COALESCE(SUM(bc.file_size_bytes), 0)::bigint AS total_bytes
                FROM questionnaires q
                INNER JOIN patients p ON p.id = q.patient_id
                INNER JOIN binary_collections bc ON (
                  bc.questionnaire_id = q.id OR bc.patient_cpf_hash = p.cpf_hash
                )
                WHERE q.id = ANY($1::uuid[])
                `,
                [questionnaireIds],
              )
            )?.[0]?.total_bytes ?? 0,
          )
        : 0;

    const reportsStorageRaw = await this.pdfReportRepo
      .createQueryBuilder('pr')
      .select('COALESCE(SUM(pr.file_size_bytes), 0)', 'total_bytes')
      .where('pr.file_path IS NOT NULL')
      .andWhere("TRIM(pr.file_path) <> ''")
      .getRawOne<{ total_bytes: string | number | null }>();
    const armazenamentoRelatoriosMinioBytes = Number(
      reportsStorageRaw?.total_bytes ?? 0,
    );
    const armazenamentoTotalBytes =
      armazenamentoColetasBytes + armazenamentoRelatoriosMinioBytes;

    const filesByTaskAgg: Record<string, number> = {};
    for (const col of taskColumns) {
      filesByTaskAgg[col.task_code] = 0;
    }
    for (const r of matrixRows) {
      for (const [code, n] of Object.entries(r.countsByTask)) {
        filesByTaskAgg[code] = (filesByTaskAgg[code] || 0) + n;
      }
    }

    const taskNameByCode = new Map(
      taskColumns.map((c) => [c.task_code, c.task_name] as const),
    );
    const filesByTask = this.sortTaskCodes(Object.keys(filesByTaskAgg)).map(
      (code) => ({
        task_code: code,
        task_name: taskNameByCode.get(code) || code,
        count: filesByTaskAgg[code] || 0,
      }),
    );

    const clinicalStrat = await this.computeClinicalStratificationKpis(
      questionnaires,
    );
    const genderKpis = await this.computeGenderKpis(questionnaires);
    const demographicsBalance = await this.computeDemographicsBalanceKpis(
      questionnaires,
    );

    const protocolTotals = this.computeProtocolStageTotals(
      matrixRows,
      taskCodes,
    );

    return {
      kpis: {
        protocolosNoAmbito: matrixRows.length,
        pacientesDistintos: distinctPatientIds.size,
        ficheirosTotais,
        progressoMedioPercent,
        metaGlobalFicheiros: EXPECTED_BINARY_FILES_TOTAL,
        ficheirosProtocoloInClinic: protocolTotals.in_clinic.ficheiros,
        metaProtocoloInClinic: protocolTotals.in_clinic.meta,
        progressoProtocoloInClinicPercent:
          protocolTotals.in_clinic.progressoPercent,
        ficheirosProtocoloSleep: protocolTotals.sleep.ficheiros,
        metaProtocoloSleep: protocolTotals.sleep.meta,
        progressoProtocoloSleepPercent: protocolTotals.sleep.progressoPercent,
        ficheirosProtocoloFreeLiving: protocolTotals.free_living.ficheiros,
        metaProtocoloFreeLiving: protocolTotals.free_living.meta,
        progressoProtocoloFreeLivingPercent:
          protocolTotals.free_living.progressoPercent,
        armazenamentoColetasBytes,
        armazenamentoRelatoriosMinioBytes,
        armazenamentoTotalBytes,
        ...clinicalStrat,
        ...genderKpis,
        ...demographicsBalance,
      },
      filesByTask,
      questionnaires: summaryQuestionnaires,
      meta: {
        limit,
        statuses,
        expectedBinaryFilesTotal: EXPECTED_BINARY_FILES_TOTAL,
        atRiskDaysWithoutUpload: AT_RISK_DAYS,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  async getReportsPatients(params: {
    statuses?: string;
    limit?: number;
  }): Promise<{
    patients: ReportPatientRowDto[];
    meta: {
      limit: number;
      statuses: string[];
      generatedAt: string;
    };
  }> {
    const statuses = this.parseStatuses(params.statuses);
    const limit = params.limit ?? DEFAULT_LIMIT;

    const { questionnaires, countsRows, taskIdToCode } =
      await this.loadScopeAndCounts(statuses, limit);
    const byQ = this.buildCountsByQuestionnaire(countsRows, taskIdToCode);

    if (questionnaires.length === 0) {
      return {
        patients: [],
        meta: {
          limit,
          statuses,
          generatedAt: new Date().toISOString(),
        },
      };
    }

    const qids = questionnaires.map((q) => q.id);

    const clinicalRaw = await this.clinicalRepo
      .createQueryBuilder('ca')
      .select('ca.questionnaire_id', 'questionnaire_id')
      .addSelect('ca.age_at_onset', 'age_at_onset')
      .addSelect('ca.other_medications', 'other_medications')
      .addSelect('hy.stage', 'stage')
      .leftJoin(HoehnYahrScale, 'hy', 'hy.id = ca.hoehn_yahr_stage_id')
      .where('ca.questionnaire_id IN (:...qids)', { qids })
      .getRawMany();

    const clinicalByQid = new Map<
      string,
      {
        age_at_onset: number | null;
        stage: string | number | null;
        other_medications: string | null;
      }
    >();
    for (const row of clinicalRaw) {
      const qid = String((row as { questionnaire_id: string }).questionnaire_id);
      const ageRaw = (row as { age_at_onset: unknown }).age_at_onset;
      const stageRaw = (row as { stage: unknown }).stage;
      const otherMeds = (row as { other_medications: unknown }).other_medications;
      clinicalByQid.set(qid, {
        age_at_onset:
          ageRaw !== null && ageRaw !== undefined && !Number.isNaN(Number(ageRaw))
            ? Number(ageRaw)
            : null,
        stage: stageRaw as string | number | null,
        other_medications:
          typeof otherMeds === 'string' && otherMeds.trim()
            ? otherMeds.trim()
            : null,
      });
    }

    const genderRaw = await this.questionnairesRepo.manager.query(
      `
      SELECT p.id AS patient_id, COALESCE(gt.code, '') AS gender_code
      FROM patients p
      LEFT JOIN gender_types gt ON gt.id = p.gender_id
      WHERE p.id = ANY($1::uuid[])
      `,
      [questionnaires.map((q) => q.patient_id)],
    );

    const genderByPatientId = new Map<string, string>();
    for (const row of genderRaw as { patient_id: string; gender_code: string }[]) {
      genderByPatientId.set(String(row.patient_id), String(row.gender_code || ''));
    }

    const anthroRaw = await this.questionnairesRepo.manager.query(
      `
      SELECT ad.questionnaire_id, ad.weight_kg, ad.bmi
      FROM anthropometric_data ad
      WHERE ad.questionnaire_id = ANY($1::uuid[])
      `,
      [qids],
    );

    const anthroByQid = new Map<
      string,
      { weightKg: number | null; bmi: number | null }
    >();
    for (const row of anthroRaw as {
      questionnaire_id: string;
      weight_kg: unknown;
      bmi: unknown;
    }[]) {
      const weightRaw = row.weight_kg;
      const bmiRaw = row.bmi;
      anthroByQid.set(String(row.questionnaire_id), {
        weightKg:
          weightRaw !== null &&
          weightRaw !== undefined &&
          !Number.isNaN(Number(weightRaw))
            ? Number(weightRaw)
            : null,
        bmi:
          bmiRaw !== null && bmiRaw !== undefined && !Number.isNaN(Number(bmiRaw))
            ? Number(bmiRaw)
            : null,
      });
    }

    const medsRaw = await this.questionnairesRepo.manager.query(
      `
      SELECT pm.questionnaire_id, mr.drug_name
      FROM patient_medications pm
      LEFT JOIN medications_reference mr ON mr.id = pm.medication_id
      WHERE pm.questionnaire_id = ANY($1::uuid[])
      ORDER BY pm.questionnaire_id, mr.drug_name
      `,
      [qids],
    );

    const drugNamesByQid = new Map<string, string[]>();
    for (const row of medsRaw as {
      questionnaire_id: string;
      drug_name: string | null;
    }[]) {
      const qid = String(row.questionnaire_id);
      const name = (row.drug_name || '').trim();
      if (!name) continue;
      const list = drugNamesByQid.get(qid) || [];
      list.push(name);
      drugNamesByQid.set(qid, list);
    }

    // Mesma agregação que define sleepTestDone (contagens TA13).
    const ta13ByQid = this.buildTaskUploadAtByQuestionnaire(
      countsRows,
      taskIdToCode,
      'TA13',
    );

    // Fallback: PDF de polissonografia (exame TA13 no formulário).
    const pdfUploadRaw = await this.pdfReportRepo.manager.query(
      `
      SELECT pr.questionnaire_id, MAX(pr.uploaded_at) AS pdf_uploaded_at
      FROM pdf_reports pr
      WHERE pr.questionnaire_id = ANY($1::uuid[])
        AND pr.report_type = 'POLYSOMNOGRAPHY'
      GROUP BY pr.questionnaire_id
      `,
      [qids],
    );

    for (const row of pdfUploadRaw as {
      questionnaire_id: string;
      pdf_uploaded_at: Date | string | null;
    }[]) {
      const iso = this.toIsoDateTime(row.pdf_uploaded_at);
      if (!iso) continue;
      const qid = String(row.questionnaire_id);
      const prev = ta13ByQid.get(qid);
      // Prefere a data do binário TA13; se não houver, usa o PDF.
      if (!prev) {
        ta13ByQid.set(qid, iso);
      }
    }

    const patients: ReportPatientRowDto[] = questionnaires.map((q) => {
      const qid = String(q.id);
      const counts = byQ.get(qid) || {};
      const clinical = clinicalByQid.get(qid);
      const grupo = this.classifyPatientGroup(q, clinical);
      const genderCode =
        genderByPatientId.get(String(q.patient_id))?.trim().toUpperCase() || '';
      const sex =
        genderCode === 'M'
          ? 'Homem'
          : genderCode === 'F'
            ? 'Mulher'
            : '—';
      const anthro = anthroByQid.get(qid);
      const drugNames = drugNamesByQid.get(qid) || [];
      const otherMeds = clinical?.other_medications || null;
      const medParts = [...drugNames];
      if (otherMeds) {
        medParts.push(`Outros: ${otherMeds}`);
      }
      const medications = medParts.length > 0 ? medParts.join('; ') : null;
      const usesMedication = drugNames.length > 0 || !!otherMeds;

      return {
        questionnaireId: q.id,
        patientLabel: this.patientLabel(q),
        patientName: q.patient?.full_name || '',
        sex,
        age: this.computeAgeYears(q.patient?.date_of_birth),
        patientGroup: grupo,
        isAdvanced: grupo === 'avancado',
        sleepTestRecommended: q.sleep_test_recommended === true,
        sleepTestDone: (counts['TA13'] || 0) > 0,
        sleepTestUploadedAt: ta13ByQid.get(qid) ?? null,
        contactPhone:
          q.patient?.phone_primary?.trim() ||
          q.patient?.phone_secondary?.trim() ||
          null,
        contactEmail: q.patient?.email?.trim() || null,
        weightKg: anthro?.weightKg ?? null,
        bmi: anthro?.bmi ?? null,
        isCurrentSmoker: q.patient?.is_current_smoker === true,
        usesMedication,
        medications,
      };
    });

    patients.sort((a, b) =>
      a.patientLabel.localeCompare(b.patientLabel, 'pt-BR', {
        numeric: true,
        sensitivity: 'base',
      }),
    );

    return {
      patients,
      meta: {
        limit,
        statuses,
        generatedAt: new Date().toISOString(),
      },
    };
  }
}
