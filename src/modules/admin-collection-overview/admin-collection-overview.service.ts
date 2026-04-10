import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Questionnaire } from '../../entities/questionnaire.entity';
import { BinaryCollection } from '../../entities/binary-collection.entity';
import { ActiveTaskDefinition } from '../../entities/active-task-definition.entity';
import { ClinicalAssessment } from '../../entities/clinical-assessment.entity';
import { HoehnYahrScale } from '../../entities/hoehn-yahr-scale.entity';
import {
  EXPECTED_BINARY_FILES_TOTAL,
  expectedFilesForTaskCode,
  sumExpectedForTaskCodes,
} from './expected-binary-files.constants';

const DEFAULT_LIMIT = 200;
const AT_RISK_DAYS = 7;

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
      SELECT q.id AS questionnaire_id, bc.task_id, COUNT(*)::text AS cnt
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
    countsRows: { questionnaire_id: string; task_id: number; cnt: string }[],
    taskIdToCode: Map<number, string>,
  ): Map<string, Record<string, number>> {
    const map = new Map<string, Record<string, number>>();
    for (const row of countsRows) {
      const code = taskIdToCode.get(row.task_id);
      if (!code) continue;
      const qid = row.questionnaire_id;
      if (!map.has(qid)) map.set(qid, {});
      const rec = map.get(qid)!;
      rec[code] = (rec[code] || 0) + parseInt(row.cnt, 10);
    }
    return map;
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
      if (D > 5) {
        pacientesAvancados++;
      } else if (D < 5 && hy <= 3) {
        pacientesPrecoces++;
      } else {
        pacientesSaudaveis++;
      }
    }

    return {
      pacientesPrecoces,
      pacientesSaudaveis,
      pacientesAvancados,
      pacientesSemClassificacaoClinica,
    };
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
      const counts = byQ.get(q.id) || {};
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
    } & ClinicalStratificationKpis;
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

    return {
      kpis: {
        protocolosNoAmbito: matrixRows.length,
        pacientesDistintos: distinctPatientIds.size,
        ficheirosTotais,
        progressoMedioPercent,
        metaGlobalFicheiros: EXPECTED_BINARY_FILES_TOTAL,
        ...clinicalStrat,
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
}
