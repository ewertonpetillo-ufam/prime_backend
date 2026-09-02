import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { BinaryCollection } from '../../entities/binary-collection.entity';
import { FreelivingActionType } from '../../entities/freeliving-action-type.entity';
import { FreelivingCollectionEvent } from '../../entities/freeliving-collection-event.entity';
import { FreelivingDiary } from '../../entities/freeliving-diary.entity';
import { Patient } from '../../entities/patient.entity';
import { ActiveTaskDefinition } from '../../entities/active-task-definition.entity';
import { CryptoUtil } from '../../utils/crypto.util';
import { FREE_LIVING_PROTOCOL_TASK_CODES } from '../admin-collection-overview/expected-binary-files.constants';
import { CreateFreelivingEventDto } from './dto/create-freeliving-event.dto';
import {
  FreelivingDiaryDto,
  FreelivingEventDto,
  FreelivingFileDto,
  FreelivingOverviewResponseDto,
  FreelivingOverviewRowDto,
  FreelivingPatientDetailResponseDto,
} from './dto/freeliving-overview.dto';
import { UpsertFreelivingDiaryDto } from './dto/upsert-freeliving-diary.dto';
import {
  DiaryOverviewStatus,
  DIARY_OVERVIEW_STATUSES,
  FreelivingDiaryGap,
} from './freeliving-diary.types';
import {
  computeDiaryGaps,
  diaryMilestoneClientEventId,
  diarySectionSummary,
  diaryStatusFromGaps,
  filledSectionCount,
  normalizeDiaryPayload,
} from './freeliving-diary.utils';
import {
  ACTION_COLLECTION_FINISHED,
  ACTION_COLLECTION_STARTED,
  ACTION_DIARY_STARTED,
  ACTION_DIARY_SUBMITTED,
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
  taskCode?: string;
  dayStatus?: string;
  hasFl01?: string;
  hasFl02?: string;
  onlyWithActivity?: string;
  diaryStatus?: string;
};

type EventAggRow = {
  id: string;
  patient_id: string;
  action_code: string;
  task_code: string | null;
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

type DiaryAggRow = {
  patient_id: string;
  diary_date: string | Date;
  protocol_day: number;
  status: string;
  save_count: number;
  gaps: FreelivingDiaryGap[] | string;
  last_saved_at: Date;
  public_identifier: string | null;
  full_name: string;
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
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(FreelivingCollectionEvent)
    private readonly eventsRepository: Repository<FreelivingCollectionEvent>,
    @InjectRepository(FreelivingActionType)
    private readonly actionTypesRepository: Repository<FreelivingActionType>,
    @InjectRepository(FreelivingDiary)
    private readonly diariesRepository: Repository<FreelivingDiary>,
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

    const taskCode = this.resolveEventTaskCode(dto.task_code);

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
      task_code: taskCode,
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

  async upsertDiary(dto: UpsertFreelivingDiaryDto): Promise<FreelivingDiaryDto> {
    if (!CryptoUtil.isValidCpfFormat(dto.patient_cpf)) {
      throw new BadRequestException('Invalid CPF format');
    }
    if (dto.diary_date && !isIsoDateOnly(dto.diary_date)) {
      throw new BadRequestException('diary_date deve ser YYYY-MM-DD');
    }

    const occurredAt = dto.occurred_at ? new Date(dto.occurred_at) : new Date();
    if (Number.isNaN(occurredAt.getTime())) {
      throw new BadRequestException('occurred_at inválido');
    }

    const diaryDate = dto.diary_date || todayInSaoPaulo();
    const cpfHash = CryptoUtil.hashCpf(dto.patient_cpf);
    const patient = await this.patientsRepository.findOne({
      where: { cpf_hash: cpfHash },
    });
    if (!patient) {
      throw new NotFoundException('Patient with this CPF not found');
    }

    return this.dataSource.transaction(async (manager) => {
      const diariesRepo = manager.getRepository(FreelivingDiary);
      let existing = await diariesRepo.findOne({
        where: { patient_id: patient.id, diary_date: diaryDate },
      });

      let payload;
      try {
        payload = normalizeDiaryPayload(dto.payload, existing?.payload);
      } catch (error) {
        throw new BadRequestException(
          error instanceof Error ? error.message : 'payload do diário inválido',
        );
      }

      let gaps = computeDiaryGaps(payload);
      let status = diaryStatusFromGaps(gaps);
      const now = new Date();
      let isFirstSave = !existing;
      let previousStatus = existing?.status ?? null;

      if (!existing) {
        existing = diariesRepo.create({
          patient_id: patient.id,
          patient_cpf_hash: cpfHash,
          diary_date: diaryDate,
          protocol_day: dto.protocol_day,
          status,
          payload,
          gaps,
          save_count: 1,
          first_saved_at: now,
          last_saved_at: now,
          client_diary_id: dto.client_diary_id ?? null,
        });
        try {
          existing = await diariesRepo.save(existing);
        } catch (error) {
          if (!isUniqueViolation(error)) throw error;
          existing = await diariesRepo.findOne({
            where: { patient_id: patient.id, diary_date: diaryDate },
          });
          if (!existing) throw error;
          isFirstSave = false;
          previousStatus = existing.status;
          try {
            payload = normalizeDiaryPayload(dto.payload, existing.payload);
          } catch (normalizeError) {
            throw new BadRequestException(
              normalizeError instanceof Error
                ? normalizeError.message
                : 'payload do diário inválido',
            );
          }
          gaps = computeDiaryGaps(payload);
          status = diaryStatusFromGaps(gaps);
        }
      }

      if (!isFirstSave && existing) {
        existing.protocol_day = dto.protocol_day;
        existing.status = status;
        existing.payload = payload;
        existing.gaps = gaps;
        existing.save_count = (existing.save_count || 0) + 1;
        existing.last_saved_at = now;
        if (dto.client_diary_id) {
          existing.client_diary_id = dto.client_diary_id;
        }
        existing = await diariesRepo.save(existing);
      }

      const saved = existing;
      if (!saved) {
        throw new BadRequestException('Não foi possível gravar o diário');
      }
      const deviceMeta = {
        device_type: dto.device_type ?? null,
        device_model: dto.device_model ?? null,
        os_version: dto.os_version ?? null,
        app_version: dto.app_version ?? null,
      };
      const eventMeta = {
        diaryId: saved.id,
        protocolDay: saved.protocol_day,
        status: saved.status,
        saveCount: saved.save_count,
        gapCount: gaps.length,
      };

      if (isFirstSave) {
        await this.recordDiaryMilestone(manager, {
          patient,
          actionCode: ACTION_DIARY_STARTED,
          diary: saved,
          occurredAt,
          collectionDate: diaryDate,
          metadata: eventMeta,
          ...deviceMeta,
        });
      }
      if (previousStatus !== 'completo' && status === 'completo') {
        await this.recordDiaryMilestone(manager, {
          patient,
          actionCode: ACTION_DIARY_SUBMITTED,
          diary: saved,
          occurredAt,
          collectionDate: diaryDate,
          metadata: eventMeta,
          ...deviceMeta,
        });
      }

      return this.toDiaryDto(saved);
    });
  }

  async getDiaryByCpf(
    patientCpf: string,
    diaryDate?: string,
  ): Promise<FreelivingDiaryDto> {
    if (!CryptoUtil.isValidCpfFormat(patientCpf)) {
      throw new BadRequestException('Invalid CPF format');
    }
    if (diaryDate && !isIsoDateOnly(diaryDate)) {
      throw new BadRequestException('diary_date deve ser YYYY-MM-DD');
    }
    const date = diaryDate || todayInSaoPaulo();
    const patient = await this.patientsRepository.findOne({
      where: { cpf_hash: CryptoUtil.hashCpf(patientCpf) },
    });
    if (!patient) {
      throw new NotFoundException('Patient with this CPF not found');
    }
    const diary = await this.diariesRepository.findOne({
      where: { patient_id: patient.id, diary_date: date },
    });
    if (!diary) {
      throw new NotFoundException('Diário não encontrado para esta data');
    }
    return this.toDiaryDto(diary);
  }

  async getOverview(
    query: FreelivingOverviewQuery,
  ): Promise<FreelivingOverviewResponseDto> {
    const { dateFrom, dateTo } = this.resolveDateRange(query);
    const onlyWithActivity = parseOptionalBoolean(query.onlyWithActivity) ?? true;
    const hasFl01 = parseOptionalBoolean(query.hasFl01);
    const hasFl02 = parseOptionalBoolean(query.hasFl02);
    const dayStatus = this.parseDayStatus(query.dayStatus);
    const diaryStatusFilter = this.parseDiaryOverviewStatus(query.diaryStatus);
    const patientTerm = (query.patient || '').trim();
    const actionCode = (query.actionCode || '').trim();
    const taskCodeFilter = normalizeTaskCode(query.taskCode);

    const [actionTypes, eventRows, fileRows, diaryRows] = await Promise.all([
      this.listActionTypes(),
      this.loadEventsInRange(dateFrom, dateTo, patientTerm),
      this.loadFilesInRange(dateFrom, dateTo, patientTerm),
      this.loadDiariesInRange(dateFrom, dateTo, patientTerm),
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
    for (const row of diaryRows) {
      addPatient(row.patient_id, row.public_identifier, row.full_name);
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

    const diariesByKey = new Map<string, DiaryAggRow>();
    for (const row of diaryRows) {
      const date = toIsoDate(row.diary_date);
      diariesByKey.set(`${row.patient_id}|${date}`, row);
    }

    let keys: string[];
    if (onlyWithActivity || !singleDay) {
      keys = [
        ...new Set([
          ...eventsByKey.keys(),
          ...filesByKey.keys(),
          ...diariesByKey.keys(),
        ]),
      ];
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

    if (taskCodeFilter) {
      const matchingPatients = new Set(
        eventRows
          .filter((row) => normalizeTaskCode(row.task_code) === taskCodeFilter)
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
      const fl01Events = events.filter(
        (e) => normalizeTaskCode(e.task_code) === 'FL01',
      );
      const fl02Events = events.filter(
        (e) => normalizeTaskCode(e.task_code) === 'FL02',
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

      const diary = diariesByKey.get(key);
      const diaryGaps = this.parseDiaryGaps(diary?.gaps);
      const overviewDiaryStatus: DiaryOverviewStatus = !diary
        ? 'sem_registro'
        : diary.status === 'completo'
          ? 'completo'
          : 'em_preenchimento';

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
        fl01DayStatus: deriveDayStatus(
          fl01Events.some((e) => e.action_code === ACTION_COLLECTION_STARTED),
          fl01Events.some((e) => e.action_code === ACTION_COLLECTION_FINISHED),
        ),
        fl02DayStatus: deriveDayStatus(
          fl02Events.some((e) => e.action_code === ACTION_COLLECTION_STARTED),
          fl02Events.some((e) => e.action_code === ACTION_COLLECTION_FINISHED),
        ),
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
        diaryStatus: overviewDiaryStatus,
        diaryProtocolDay: diary ? Number(diary.protocol_day) : null,
        diarySaveCount: diary ? Number(diary.save_count) || 0 : 0,
        diaryGapCount: diaryGaps.length,
        diaryFilledSectionCount: diary ? filledSectionCount(diaryGaps) : 0,
        diaryLastSavedAt: diary ? toIsoDateTime(diary.last_saved_at) : null,
      };

      if (dayStatus && row.dayStatus !== dayStatus) continue;
      if (diaryStatusFilter && row.diaryStatus !== diaryStatusFilter) continue;
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
        .filter(
          (r) =>
            r.eventCount > 0 ||
            r.fl01FileCount > 0 ||
            r.fl02FileCount > 0 ||
            r.diaryStatus !== 'sem_registro',
        )
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
        diariosEmPreenchimento: new Set(
          rows
            .filter((r) => r.diaryStatus === 'em_preenchimento')
            .map((r) => r.patientId),
        ).size,
        diariosCompletos: new Set(
          rows
            .filter((r) => r.diaryStatus === 'completo')
            .map((r) => r.patientId),
        ).size,
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
    const diary = await this.diariesRepository.findOne({
      where: { patient_id: patientId, diary_date: collectionDate },
    });

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
      diary: diary ? this.toDiaryDto(diary) : null,
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

  private parseDiaryOverviewStatus(
    value: string | undefined,
  ): DiaryOverviewStatus | undefined {
    if (!value) return undefined;
    if ((DIARY_OVERVIEW_STATUSES as string[]).includes(value)) {
      return value as DiaryOverviewStatus;
    }
    throw new BadRequestException(`diaryStatus inválido: ${value}`);
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
        'e.task_code AS task_code',
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

  private async loadDiariesInRange(
    dateFrom: string,
    dateTo: string,
    patientTerm: string,
  ): Promise<DiaryAggRow[]> {
    const qb = this.diariesRepository
      .createQueryBuilder('d')
      .innerJoin(Patient, 'p', 'p.id = d.patient_id')
      .select([
        'd.patient_id AS patient_id',
        'd.diary_date AS diary_date',
        'd.protocol_day AS protocol_day',
        'd.status AS status',
        'd.save_count AS save_count',
        'd.gaps AS gaps',
        'd.last_saved_at AS last_saved_at',
        'p.public_identifier AS public_identifier',
        'p.full_name AS full_name',
      ])
      .where('d.diary_date BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo })
      .andWhere(
        '(p.public_identifier IS NULL OR p.public_identifier NOT IN (:...excluded))',
        { excluded: [...EXCLUDED_FREELIVING_PUBLIC_IDS] },
      );
    this.applyPatientSearch(qb, patientTerm, 'p');
    return qb.getRawMany<DiaryAggRow>();
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

  private resolveEventTaskCode(raw: string | undefined): string | null {
    const taskCode = normalizeTaskCode(raw);
    return taskCode || null;
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

  private parseDiaryGaps(raw: DiaryAggRow['gaps'] | undefined): FreelivingDiaryGap[] {
    if (!raw) return [];
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return Array.isArray(raw) ? raw : [];
  }

  private toDiaryDto(diary: FreelivingDiary): FreelivingDiaryDto {
    const gaps = Array.isArray(diary.gaps) ? diary.gaps : [];
    const summary = diarySectionSummary(gaps);
    return {
      id: diary.id,
      diaryDate: toIsoDate(diary.diary_date),
      protocolDay: diary.protocol_day,
      status: diary.status,
      payload: diary.payload,
      gaps,
      gapCount: gaps.length,
      filledSectionCount: summary.filledSectionCount,
      sectionCount: summary.sectionCount,
      saveCount: diary.save_count,
      firstSavedAt: toIsoDateTime(diary.first_saved_at) || new Date().toISOString(),
      lastSavedAt: toIsoDateTime(diary.last_saved_at) || new Date().toISOString(),
    };
  }

  private async recordDiaryMilestone(
    manager: EntityManager,
    params: {
      patient: Patient;
      actionCode: typeof ACTION_DIARY_STARTED | typeof ACTION_DIARY_SUBMITTED;
      diary: FreelivingDiary;
      occurredAt: Date;
      collectionDate: string;
      metadata: Record<string, unknown>;
      device_type: string | null;
      device_model: string | null;
      os_version: string | null;
      app_version: string | null;
    },
  ): Promise<void> {
    const actionTypesRepo = manager.getRepository(FreelivingActionType);
    const eventsRepo = manager.getRepository(FreelivingCollectionEvent);
    const actionType = await actionTypesRepo.findOne({
      where: { code: params.actionCode, active: true },
    });
    if (!actionType) {
      throw new BadRequestException(
        `Ação FreeLiving desconhecida ou inativa: ${params.actionCode}`,
      );
    }

    const clientEventId = diaryMilestoneClientEventId(
      params.diary.id,
      params.actionCode,
    );
    const already = await eventsRepo.findOne({
      where: { client_event_id: clientEventId },
    });
    if (already) return;

    const entity = eventsRepo.create({
      patient_id: params.patient.id,
      patient_cpf_hash: params.patient.cpf_hash,
      action_code: actionType.code,
      task_code: null,
      occurred_at: params.occurredAt,
      received_at: new Date(),
      collection_date: params.collectionDate,
      client_event_id: clientEventId,
      source: 'collection_app',
      device_type: params.device_type,
      device_model: params.device_model,
      os_version: params.os_version,
      app_version: params.app_version,
      metadata: params.metadata,
    });

    try {
      await eventsRepo.save(entity);
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }

  private toEventDto(
    event: FreelivingCollectionEvent,
    actionType: { code: string; label_pt: string },
  ): FreelivingEventDto {
    return {
      id: event.id,
      actionCode: event.action_code,
      actionLabel: actionType.label_pt,
      taskCode: event.task_code ? normalizeTaskCode(event.task_code) : null,
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
