import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BinaryCollection } from '../../entities/binary-collection.entity';
import { FreelivingActionType } from '../../entities/freeliving-action-type.entity';
import { FreelivingCollectionEvent } from '../../entities/freeliving-collection-event.entity';
import { Patient } from '../../entities/patient.entity';
import { ActiveTaskDefinition } from '../../entities/active-task-definition.entity';
import { CryptoUtil } from '../../utils/crypto.util';
import { FREE_LIVING_PROTOCOL_TASK_CODES } from '../admin-collection-overview/expected-binary-files.constants';
import { CreateFreelivingEventDto } from './dto/create-freeliving-event.dto';
import {
  FreelivingEventDto,
  FreelivingFileDto,
  FreelivingOverviewResponseDto,
  FreelivingOverviewRowDto,
  FreelivingPatientDetailResponseDto,
} from './dto/freeliving-overview.dto';
import {
  ACTION_COLLECTION_FINISHED,
  ACTION_COLLECTION_STARTED,
  EXCLUDED_FREELIVING_PUBLIC_IDS,
  FreelivingDayStatus,
  FREELIVING_DAY_STATUSES,
  deriveDayStatus,
  formatDateInTimeZone,
  isIsoDateOnly,
  isUniqueViolation,
  parseOptionalBoolean,
  todayInSaoPaulo,
} from './freeliving.utils';

export type CreateFreelivingEventResult = {
  created: boolean;
  event: FreelivingEventDto;
};

export type FreelivingOverviewQuery = {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  patient?: string;
  actionCode?: string;
  dayStatus?: string;
  hasFl01?: string;
  hasFl02?: string;
  onlyWithActivity?: string;
};

type EventAggRow = {
  id: string;
  patient_id: string;
  action_code: string;
  occurred_at: Date;
  received_at: Date;
  collection_date: string | Date;
  public_identifier: string | null;
  full_name: string;
};

type FileAggRow = {
  id: string;
  patient_id: string;
  task_code: string;
  uploaded_at: Date;
  file_size_bytes: number;
  file_name: string | null;
  collection_date: string | Date;
};

function toIsoDate(value: unknown): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(value ?? '').slice(0, 10);
}

function toIsoDateTime(value: Date | string | null | undefined): string | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function normalizeTaskCode(value: string | null | undefined): string {
  return (value || '').trim().toUpperCase();
}

@Injectable()
export class FreelivingService {
  constructor(
    @InjectRepository(FreelivingCollectionEvent)
    private readonly eventsRepository: Repository<FreelivingCollectionEvent>,
    @InjectRepository(FreelivingActionType)
    private readonly actionTypesRepository: Repository<FreelivingActionType>,
    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,
    @InjectRepository(BinaryCollection)
    private readonly binaryCollectionsRepository: Repository<BinaryCollection>,
  ) {}

  async createEvent(
    dto: CreateFreelivingEventDto,
  ): Promise<CreateFreelivingEventResult> {
    if (!CryptoUtil.isValidCpfFormat(dto.patient_cpf)) {
      throw new BadRequestException('Invalid CPF format');
    }

    const actionCode = dto.action_code.trim();
    const actionType = await this.actionTypesRepository.findOne({
      where: { code: actionCode, active: true },
    });
    if (!actionType) {
      throw new BadRequestException(
        `Ação FreeLiving desconhecida ou inativa: ${dto.action_code}`,
      );
    }

    if (dto.client_event_id) {
      const existing = await this.eventsRepository.findOne({
        where: { client_event_id: dto.client_event_id },
        relations: ['action_type'],
      });
      if (existing) {
        return { created: false, event: this.toEventDto(existing, actionType) };
      }
    }

    const cpfHash = CryptoUtil.hashCpf(dto.patient_cpf);
    const patient = await this.patientsRepository.findOne({
      where: { cpf_hash: cpfHash },
    });
    if (!patient) {
      throw new NotFoundException('Patient with this CPF not found');
    }

    const occurredAt = dto.occurred_at ? new Date(dto.occurred_at) : new Date();
    if (Number.isNaN(occurredAt.getTime())) {
      throw new BadRequestException('occurred_at inválido');
    }

    const collectionDate = formatDateInTimeZone(occurredAt);

    const entity = this.eventsRepository.create({
      patient_id: patient.id,
      patient_cpf_hash: cpfHash,
      action_code: actionType.code,
      occurred_at: occurredAt,
      received_at: new Date(),
      collection_date: collectionDate,
      client_event_id: dto.client_event_id ?? null,
      source: 'collection_app',
      device_type: dto.device_type ?? null,
      device_model: dto.device_model ?? null,
      os_version: dto.os_version ?? null,
      app_version: dto.app_version ?? null,
      metadata: dto.metadata ?? {},
    });

    try {
      const saved = await this.eventsRepository.save(entity);
      saved.action_type = actionType;
      return { created: true, event: this.toEventDto(saved, actionType) };
    } catch (error) {
      if (dto.client_event_id && isUniqueViolation(error)) {
        const existing = await this.eventsRepository.findOne({
          where: { client_event_id: dto.client_event_id },
          relations: ['action_type'],
        });
        if (existing) {
          return {
            created: false,
            event: this.toEventDto(existing, existing.action_type ?? actionType),
          };
        }
      }
      throw error;
    }
  }

  async getOverview(
    query: FreelivingOverviewQuery,
  ): Promise<FreelivingOverviewResponseDto> {
    const { dateFrom, dateTo } = this.resolveDateRange(query);
    const onlyWithActivity = parseOptionalBoolean(query.onlyWithActivity) ?? true;
    const hasFl01 = parseOptionalBoolean(query.hasFl01);
    const hasFl02 = parseOptionalBoolean(query.hasFl02);
    const dayStatus = this.parseDayStatus(query.dayStatus);
    const patientTerm = (query.patient || '').trim();
    const actionCode = (query.actionCode || '').trim();

    const [actionTypes, eventRows, fileRows] = await Promise.all([
      this.listActionTypes(),
      this.loadEventsInRange(dateFrom, dateTo, patientTerm),
      this.loadFilesInRange(dateFrom, dateTo, patientTerm),
    ]);

    const patientsById = new Map<
      string,
      { patientId: string; patientLabel: string; patientName: string }
    >();

    const addPatient = (
      patientId: string,
      label: string | null,
      name: string,
    ) => {
      if (!patientsById.has(patientId)) {
        patientsById.set(patientId, {
          patientId,
          patientLabel: label || '—',
          patientName: name,
        });
      }
    };

    for (const row of eventRows) {
      addPatient(row.patient_id, row.public_identifier, row.full_name);
    }
    for (const row of fileRows) {
      addPatient(row.patient_id, null, '');
    }

    if (fileRows.length > 0) {
      const missing = [...new Set(fileRows.map((r) => r.patient_id))].filter(
        (id) => !patientsById.get(id)?.patientName,
      );
      if (missing.length > 0) {
        const patients = await this.patientsRepository.find({
          where: { id: In(missing) },
          select: ['id', 'public_identifier', 'full_name'],
        });
        for (const p of patients) {
          patientsById.set(p.id, {
            patientId: p.id,
            patientLabel: p.public_identifier || '—',
            patientName: p.full_name,
          });
        }
      }
    }

    const datesInRange = this.enumerateDates(dateFrom, dateTo);
    const singleDay = dateFrom === dateTo;

    if (!onlyWithActivity && singleDay) {
      const extraPatients = await this.loadActivePatients(patientTerm);
      for (const p of extraPatients) {
        addPatient(p.id, p.public_identifier, p.full_name);
      }
    }

    const eventsByKey = new Map<string, EventAggRow[]>();
    for (const row of eventRows) {
      const date = toIsoDate(row.collection_date);
      const key = `${row.patient_id}|${date}`;
      const list = eventsByKey.get(key) ?? [];
      list.push(row);
      eventsByKey.set(key, list);
    }

    const filesByKey = new Map<string, FileAggRow[]>();
    for (const row of fileRows) {
      const date = toIsoDate(row.collection_date);
      const key = `${row.patient_id}|${date}`;
      const list = filesByKey.get(key) ?? [];
      list.push(row);
      filesByKey.set(key, list);
    }

    let keys: string[];
    if (onlyWithActivity || !singleDay) {
      keys = [...new Set([...eventsByKey.keys(), ...filesByKey.keys()])];
    } else {
      keys = [...patientsById.keys()].map((id) => `${id}|${dateFrom}`);
    }

    if (actionCode) {
      const matchingPatients = new Set(
        eventRows
          .filter((row) => row.action_code === actionCode)
          .map((row) => row.patient_id),
      );
      keys = keys.filter((key) => matchingPatients.has(key.split('|')[0]));
    }

    const rows: FreelivingOverviewRowDto[] = [];
    for (const key of keys) {
      const [patientId, collectionDate] = key.split('|');
      const patient = patientsById.get(patientId);
      if (!patient) continue;
      if (collectionDate < dateFrom || collectionDate > dateTo) continue;
      if (!datesInRange.includes(collectionDate) && datesInRange.length > 0) {
        continue;
      }

      const events = eventsByKey.get(key) ?? [];
      const files = filesByKey.get(key) ?? [];
      const started = events.filter(
        (e) => e.action_code === ACTION_COLLECTION_STARTED,
      );
      const finished = events.filter(
        (e) => e.action_code === ACTION_COLLECTION_FINISHED,
      );
      const fl01 = files.filter((f) => normalizeTaskCode(f.task_code) === 'FL01');
      const fl02 = files.filter((f) => normalizeTaskCode(f.task_code) === 'FL02');
      const lastEvent = events.reduce<EventAggRow | null>((best, current) => {
        if (!best) return current;
        return new Date(current.occurred_at).getTime() >
          new Date(best.occurred_at).getTime()
          ? current
          : best;
      }, null);
      const lastReceived = events.reduce<EventAggRow | null>((best, current) => {
        if (!best) return current;
        return new Date(current.received_at).getTime() >
          new Date(best.received_at).getTime()
          ? current
          : best;
      }, null);

      const row: FreelivingOverviewRowDto = {
        patientId: patient.patientId,
        patientLabel: patient.patientLabel,
        patientName: patient.patientName,
        collectionDate,
        dayStatus: deriveDayStatus(started.length > 0, finished.length > 0),
        firstStartedAt: this.minIso(
          started.map((e) => toIsoDateTime(e.occurred_at)),
        ),
        lastFinishedAt: this.maxIso(
          finished.map((e) => toIsoDateTime(e.occurred_at)),
        ),
        eventCount: events.length,
        fl01FileCount: fl01.length,
        fl01LastUploadedAt: this.maxIso(
          fl01.map((f) => toIsoDateTime(f.uploaded_at)),
        ),
        fl02FileCount: fl02.length,
        fl02LastUploadedAt: this.maxIso(
          fl02.map((f) => toIsoDateTime(f.uploaded_at)),
        ),
        lastEventAt: lastEvent ? toIsoDateTime(lastEvent.occurred_at) : null,
        lastEventReceivedAt: lastReceived
          ? toIsoDateTime(lastReceived.received_at)
          : null,
      };

      if (dayStatus && row.dayStatus !== dayStatus) continue;
      if (hasFl01 === true && row.fl01FileCount === 0) continue;
      if (hasFl01 === false && row.fl01FileCount > 0) continue;
      if (hasFl02 === true && row.fl02FileCount === 0) continue;
      if (hasFl02 === false && row.fl02FileCount > 0) continue;

      rows.push(row);
    }

    rows.sort((a, b) => {
      const receivedDiff =
        (b.lastEventReceivedAt ? Date.parse(b.lastEventReceivedAt) : 0) -
        (a.lastEventReceivedAt ? Date.parse(a.lastEventReceivedAt) : 0);
      if (receivedDiff !== 0) return receivedDiff;
      const dateDiff = b.collectionDate.localeCompare(a.collectionDate);
      if (dateDiff !== 0) return dateDiff;
      return a.patientLabel.localeCompare(b.patientLabel, 'pt-BR', {
        numeric: true,
        sensitivity: 'base',
      });
    });

    const patientIdsWithActivity = new Set(
      rows
        .filter((r) => r.eventCount > 0 || r.fl01FileCount > 0 || r.fl02FileCount > 0)
        .map((r) => r.patientId),
    );
    const iniciaram = new Set(
      rows
        .filter(
          (r) =>
            r.dayStatus === 'iniciou' || r.dayStatus === 'iniciou_e_finalizou',
        )
        .map((r) => r.patientId),
    );
    const finalizaram = new Set(
      rows
        .filter(
          (r) =>
            r.dayStatus === 'finalizou' || r.dayStatus === 'iniciou_e_finalizou',
        )
        .map((r) => r.patientId),
    );

    const ultimoEventoRecebidoAt = this.maxIso(
      rows.map((r) => r.lastEventReceivedAt),
    );

    return {
      kpis: {
        pacientesComAtividade: patientIdsWithActivity.size,
        iniciaram: iniciaram.size,
        finalizaram: finalizaram.size,
        arquivosFl01: rows.reduce((sum, r) => sum + r.fl01FileCount, 0),
        arquivosFl02: rows.reduce((sum, r) => sum + r.fl02FileCount, 0),
        ultimoEventoRecebidoAt,
      },
      rows,
      meta: {
        dateFrom,
        dateTo,
        generatedAt: new Date().toISOString(),
        actionTypes,
      },
    };
  }

  async getPatientDetail(
    patientId: string,
    date?: string,
  ): Promise<FreelivingPatientDetailResponseDto> {
    const collectionDate = isIsoDateOnly(date) ? date : todayInSaoPaulo();
    const patient = await this.patientsRepository.findOne({
      where: { id: patientId },
      select: ['id', 'public_identifier', 'full_name'],
    });
    if (!patient) {
      throw new NotFoundException('Paciente não encontrado');
    }

    const actionTypes = await this.listActionTypes();
    const labelByCode = new Map(actionTypes.map((t) => [t.code, t.label_pt]));

    const events = await this.eventsRepository.find({
      where: { patient_id: patientId, collection_date: collectionDate },
      order: { occurred_at: 'ASC', received_at: 'ASC' },
    });

    const fileRows = await this.loadFilesForPatient(patientId, collectionDate);

    return {
      patientId: patient.id,
      patientLabel: patient.public_identifier || '—',
      patientName: patient.full_name,
      collectionDate,
      events: events.map((event) =>
        this.toEventDto(event, {
          code: event.action_code,
          label_pt: labelByCode.get(event.action_code) || event.action_code,
        }),
      ),
      files: fileRows.map((file) => this.toFileDto(file)),
    };
  }

  private resolveDateRange(query: FreelivingOverviewQuery): {
    dateFrom: string;
    dateTo: string;
  } {
    if (isIsoDateOnly(query.date)) {
      return { dateFrom: query.date, dateTo: query.date };
    }
    const dateFrom = isIsoDateOnly(query.dateFrom)
      ? query.dateFrom
      : todayInSaoPaulo();
    const dateTo = isIsoDateOnly(query.dateTo) ? query.dateTo : dateFrom;
    if (dateFrom > dateTo) {
      throw new BadRequestException('dateFrom não pode ser posterior a dateTo');
    }
    return { dateFrom, dateTo };
  }

  private parseDayStatus(
    value: string | undefined,
  ): FreelivingDayStatus | undefined {
    if (!value) return undefined;
    if ((FREELIVING_DAY_STATUSES as string[]).includes(value)) {
      return value as FreelivingDayStatus;
    }
    throw new BadRequestException(`dayStatus inválido: ${value}`);
  }

  private async listActionTypes() {
    const types = await this.actionTypesRepository.find({
      where: { active: true },
      order: { sort_order: 'ASC', code: 'ASC' },
    });
    return types.map((t) => ({ code: t.code, label_pt: t.label_pt }));
  }

  private async loadActivePatients(patientTerm: string) {
    const qb = this.patientsRepository
      .createQueryBuilder('p')
      .select(['p.id', 'p.public_identifier', 'p.full_name'])
      .where('p.active = true')
      .andWhere('p.public_identifier NOT IN (:...excluded)', {
        excluded: [...EXCLUDED_FREELIVING_PUBLIC_IDS],
      });
    this.applyPatientSearch(qb, patientTerm, 'p');
    return qb.getMany();
  }

  private async loadEventsInRange(
    dateFrom: string,
    dateTo: string,
    patientTerm: string,
  ): Promise<EventAggRow[]> {
    const qb = this.eventsRepository
      .createQueryBuilder('e')
      .innerJoin(Patient, 'p', 'p.id = e.patient_id')
      .select([
        'e.id AS id',
        'e.patient_id AS patient_id',
        'e.action_code AS action_code',
        'e.occurred_at AS occurred_at',
        'e.received_at AS received_at',
        'e.collection_date AS collection_date',
        'p.public_identifier AS public_identifier',
        'p.full_name AS full_name',
      ])
      .where('e.collection_date BETWEEN :dateFrom AND :dateTo', {
        dateFrom,
        dateTo,
      })
      .andWhere(
        '(p.public_identifier IS NULL OR p.public_identifier NOT IN (:...excluded))',
        { excluded: [...EXCLUDED_FREELIVING_PUBLIC_IDS] },
      );
    this.applyPatientSearch(qb, patientTerm, 'p');
    return qb.getRawMany<EventAggRow>();
  }

  private async loadFilesInRange(
    dateFrom: string,
    dateTo: string,
    patientTerm: string,
  ): Promise<FileAggRow[]> {
    const taskCodes = this.freeLivingTaskCodes();
    if (taskCodes.length === 0) return [];

    const qb = this.binaryCollectionsRepository
      .createQueryBuilder('bc')
      .innerJoin(Patient, 'p', 'p.cpf_hash = bc.patient_cpf_hash')
      .leftJoin(ActiveTaskDefinition, 'at', 'at.id = bc.task_id')
      .select([
        'bc.id AS id',
        'p.id AS patient_id',
        `COALESCE(at.task_code, bc.metadata->>'task_code') AS task_code`,
        'bc.uploaded_at AS uploaded_at',
        'bc.file_size_bytes AS file_size_bytes',
        `bc.metadata->>'file_name' AS file_name`,
        `(bc.uploaded_at AT TIME ZONE 'America/Sao_Paulo')::date AS collection_date`,
      ])
      .where('COALESCE(bc.deleted_pending, false) = false')
      .andWhere(
        `UPPER(TRIM(COALESCE(at.task_code, bc.metadata->>'task_code', ''))) IN (:...taskCodes)`,
        { taskCodes },
      )
      .andWhere(
        `(bc.uploaded_at AT TIME ZONE 'America/Sao_Paulo')::date BETWEEN :dateFrom AND :dateTo`,
        { dateFrom, dateTo },
      )
      .andWhere(
        '(p.public_identifier IS NULL OR p.public_identifier NOT IN (:...excluded))',
        { excluded: [...EXCLUDED_FREELIVING_PUBLIC_IDS] },
      );
    this.applyPatientSearch(qb, patientTerm, 'p');
    return qb.getRawMany<FileAggRow>();
  }

  private async loadFilesForPatient(
    patientId: string,
    collectionDate: string,
  ): Promise<FileAggRow[]> {
    const taskCodes = this.freeLivingTaskCodes();
    if (taskCodes.length === 0) return [];

    return this.binaryCollectionsRepository
      .createQueryBuilder('bc')
      .innerJoin(Patient, 'p', 'p.cpf_hash = bc.patient_cpf_hash')
      .leftJoin(ActiveTaskDefinition, 'at', 'at.id = bc.task_id')
      .select([
        'bc.id AS id',
        'p.id AS patient_id',
        `COALESCE(at.task_code, bc.metadata->>'task_code') AS task_code`,
        'bc.uploaded_at AS uploaded_at',
        'bc.file_size_bytes AS file_size_bytes',
        `bc.metadata->>'file_name' AS file_name`,
        `(bc.uploaded_at AT TIME ZONE 'America/Sao_Paulo')::date AS collection_date`,
      ])
      .where('p.id = :patientId', { patientId })
      .andWhere('COALESCE(bc.deleted_pending, false) = false')
      .andWhere(
        `UPPER(TRIM(COALESCE(at.task_code, bc.metadata->>'task_code', ''))) IN (:...taskCodes)`,
        { taskCodes },
      )
      .andWhere(
        `(bc.uploaded_at AT TIME ZONE 'America/Sao_Paulo')::date = :collectionDate`,
        { collectionDate },
      )
      .orderBy('bc.uploaded_at', 'ASC')
      .getRawMany<FileAggRow>();
  }

  private applyPatientSearch(
    qb: { andWhere: (sql: string, params?: object) => unknown },
    patientTerm: string,
    alias: string,
  ) {
    if (!patientTerm) return;
    qb.andWhere(
      `(LOWER(COALESCE(${alias}.full_name, '')) LIKE LOWER(:patientTerm)
        OR LOWER(COALESCE(${alias}.public_identifier, '')) LIKE LOWER(:patientTerm))`,
      { patientTerm: `%${patientTerm}%` },
    );
  }

  private freeLivingTaskCodes(): string[] {
    return FREE_LIVING_PROTOCOL_TASK_CODES.map((c) => c.toUpperCase());
  }

  private enumerateDates(from: string, to: string): string[] {
    const dates: string[] = [];
    const cursor = new Date(`${from}T00:00:00Z`);
    const end = new Date(`${to}T00:00:00Z`);
    while (cursor.getTime() <= end.getTime()) {
      dates.push(toIsoDate(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return dates;
  }

  private minIso(values: Array<string | null>): string | null {
    const valid = values.filter((v): v is string => Boolean(v));
    if (valid.length === 0) return null;
    return valid.reduce((min, current) => (current < min ? current : min));
  }

  private maxIso(values: Array<string | null>): string | null {
    const valid = values.filter((v): v is string => Boolean(v));
    if (valid.length === 0) return null;
    return valid.reduce((max, current) => (current > max ? current : max));
  }

  private toEventDto(
    event: FreelivingCollectionEvent,
    actionType: { code: string; label_pt: string },
  ): FreelivingEventDto {
    return {
      id: event.id,
      actionCode: event.action_code,
      actionLabel: actionType.label_pt,
      occurredAt: toIsoDateTime(event.occurred_at) || new Date().toISOString(),
      receivedAt: toIsoDateTime(event.received_at) || new Date().toISOString(),
      collectionDate: toIsoDate(event.collection_date),
      deviceType: event.device_type,
      deviceModel: event.device_model,
      osVersion: event.os_version,
      appVersion: event.app_version,
      metadata: event.metadata || {},
      source: event.source,
    };
  }

  private toFileDto(file: FileAggRow): FreelivingFileDto {
    return {
      id: file.id,
      taskCode: normalizeTaskCode(file.task_code),
      fileName: file.file_name || 'arquivo',
      fileSizeBytes: Number(file.file_size_bytes) || 0,
      uploadedAt: toIsoDateTime(file.uploaded_at) || new Date().toISOString(),
    };
  }
}
