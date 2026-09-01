import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BinaryCollection } from '../../entities/binary-collection.entity';
import { FreelivingActionType } from '../../entities/freeliving-action-type.entity';
import { FreelivingCollectionEvent } from '../../entities/freeliving-collection-event.entity';
import { Patient } from '../../entities/patient.entity';
import { CryptoUtil } from '../../utils/crypto.util';
import { FreelivingService } from './freeliving.service';
import {
  deriveDayStatus,
  formatDateInTimeZone,
  isIsoDateOnly,
  parseOptionalBoolean,
  todayInSaoPaulo,
} from './freeliving.utils';

describe('freeliving.utils', () => {
  it('deriveDayStatus cobre os quatro estados', () => {
    expect(deriveDayStatus(false, false)).toBe('sem_acao');
    expect(deriveDayStatus(true, false)).toBe('iniciou');
    expect(deriveDayStatus(false, true)).toBe('finalizou');
    expect(deriveDayStatus(true, true)).toBe('iniciou_e_finalizou');
  });

  it('formatDateInTimeZone usa America/Sao_Paulo', () => {
    const utcMidnight = new Date('2026-09-02T02:30:00.000Z');
    expect(formatDateInTimeZone(utcMidnight)).toBe('2026-09-01');
  });

  it('todayInSaoPaulo devolve YYYY-MM-DD', () => {
    expect(isIsoDateOnly(todayInSaoPaulo())).toBe(true);
  });

  it('parseOptionalBoolean aceita sinônimos', () => {
    expect(parseOptionalBoolean('true')).toBe(true);
    expect(parseOptionalBoolean('1')).toBe(true);
    expect(parseOptionalBoolean('sim')).toBe(true);
    expect(parseOptionalBoolean('false')).toBe(false);
    expect(parseOptionalBoolean('nao')).toBe(false);
    expect(parseOptionalBoolean(undefined)).toBeUndefined();
  });
});

describe('FreelivingService.createEvent', () => {
  let service: FreelivingService;

  const eventsRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const actionTypesRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const patientsRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const binaryRepo = {
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    CryptoUtil.setConfigService({
      get: jest.fn().mockReturnValue('test-hmac-secret'),
    } as unknown as ConfigService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FreelivingService,
        {
          provide: getRepositoryToken(FreelivingCollectionEvent),
          useValue: eventsRepo,
        },
        {
          provide: getRepositoryToken(FreelivingActionType),
          useValue: actionTypesRepo,
        },
        { provide: getRepositoryToken(Patient), useValue: patientsRepo },
        {
          provide: getRepositoryToken(BinaryCollection),
          useValue: binaryRepo,
        },
      ],
    }).compile();

    service = module.get(FreelivingService);
    jest.clearAllMocks();
  });

  it('rejeita CPF inválido', async () => {
    await expect(
      service.createEvent({
        patient_cpf: '123',
        action_code: 'collection_started',
        task_code: 'FL01',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejeita ação desconhecida', async () => {
    actionTypesRepo.findOne.mockResolvedValue(null);
    await expect(
      service.createEvent({
        patient_cpf: '52998224725',
        action_code: 'unknown_action',
        task_code: 'FL01',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejeita paciente inexistente', async () => {
    actionTypesRepo.findOne.mockResolvedValue({
      code: 'collection_started',
      label_pt: 'Iniciou coleta',
      active: true,
    });
    eventsRepo.findOne.mockResolvedValue(null);
    patientsRepo.findOne.mockResolvedValue(null);

    await expect(
      service.createEvent({
        patient_cpf: '52998224725',
        action_code: 'collection_started',
        task_code: 'FL01',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('devolve evento existente quando client_event_id já foi gravado', async () => {
    const actionType = {
      code: 'collection_started',
      label_pt: 'Iniciou coleta',
      active: true,
    };
    actionTypesRepo.findOne.mockResolvedValue(actionType);
    eventsRepo.findOne.mockResolvedValue({
      id: 'evt-1',
      action_code: 'collection_started',
      task_code: 'FL01',
      occurred_at: new Date('2026-09-01T12:00:00.000Z'),
      received_at: new Date('2026-09-01T12:00:01.000Z'),
      collection_date: '2026-09-01',
      device_type: null,
      device_model: null,
      os_version: null,
      app_version: null,
      metadata: {},
      source: 'collection_app',
      action_type: actionType,
    });

    const result = await service.createEvent({
      patient_cpf: '52998224725',
      action_code: 'collection_started',
      task_code: 'FL01',
      client_event_id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    });

    expect(result.created).toBe(false);
    expect(result.event.id).toBe('evt-1');
    expect(result.event.actionLabel).toBe('Iniciou coleta');
    expect(eventsRepo.save).not.toHaveBeenCalled();
  });

  it('grava novo evento', async () => {
    const actionType = {
      code: 'collection_finished',
      label_pt: 'Finalizou coleta',
      active: true,
    };
    actionTypesRepo.findOne.mockResolvedValue(actionType);
    eventsRepo.findOne.mockResolvedValue(null);
    patientsRepo.findOne.mockResolvedValue({
      id: 'patient-1',
      cpf_hash: 'hash',
    });
    const saved = {
      id: 'evt-2',
      action_code: 'collection_finished',
      task_code: 'FL02',
      occurred_at: new Date('2026-09-01T15:00:00.000Z'),
      received_at: new Date('2026-09-01T15:00:02.000Z'),
      collection_date: '2026-09-01',
      device_type: 'smartphone',
      device_model: null,
      os_version: null,
      app_version: '1.0.0',
      metadata: {},
      source: 'collection_app',
    };
    eventsRepo.create.mockReturnValue(saved);
    eventsRepo.save.mockResolvedValue(saved);

    const result = await service.createEvent({
      patient_cpf: '52998224725',
      action_code: 'collection_finished',
      task_code: 'FL02',
      app_version: '1.0.0',
      device_type: 'smartphone',
    });

    expect(result.created).toBe(true);
    expect(result.event.actionCode).toBe('collection_finished');
    expect(eventsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ task_code: 'FL02' }),
    );
    expect(eventsRepo.save).toHaveBeenCalled();
  });

  it('grava evento sem task_code (ação geral, sem tarefa ativa)', async () => {
    const actionType = {
      code: 'collection_started',
      label_pt: 'Iniciou coleta',
      active: true,
    };
    actionTypesRepo.findOne.mockResolvedValue(actionType);
    eventsRepo.findOne.mockResolvedValue(null);
    patientsRepo.findOne.mockResolvedValue({
      id: 'patient-1',
      cpf_hash: 'hash',
    });
    const saved = {
      id: 'evt-3',
      action_code: 'collection_started',
      task_code: null,
      occurred_at: new Date('2026-09-01T16:00:00.000Z'),
      received_at: new Date('2026-09-01T16:00:01.000Z'),
      collection_date: '2026-09-01',
      device_type: null,
      device_model: null,
      os_version: null,
      app_version: null,
      metadata: {},
      source: 'collection_app',
    };
    eventsRepo.create.mockReturnValue(saved);
    eventsRepo.save.mockResolvedValue(saved);

    const result = await service.createEvent({
      patient_cpf: '52998224725',
      action_code: 'collection_started',
    });

    expect(result.created).toBe(true);
    expect(eventsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ task_code: null }),
    );
    expect(result.event.taskCode).toBeNull();
  });

  it('aceita task_code livre, sem exigir tarefa ativa', async () => {
    const actionType = {
      code: 'collection_started',
      label_pt: 'Iniciou coleta',
      active: true,
    };
    actionTypesRepo.findOne.mockResolvedValue(actionType);
    eventsRepo.findOne.mockResolvedValue(null);
    patientsRepo.findOne.mockResolvedValue({
      id: 'patient-1',
      cpf_hash: 'hash',
    });
    const saved = {
      id: 'evt-4',
      action_code: 'collection_started',
      task_code: 'DAILY_DIARY',
      occurred_at: new Date('2026-09-01T17:00:00.000Z'),
      received_at: new Date('2026-09-01T17:00:01.000Z'),
      collection_date: '2026-09-01',
      device_type: null,
      device_model: null,
      os_version: null,
      app_version: null,
      metadata: {},
      source: 'collection_app',
    };
    eventsRepo.create.mockReturnValue(saved);
    eventsRepo.save.mockResolvedValue(saved);

    const result = await service.createEvent({
      patient_cpf: '52998224725',
      action_code: 'collection_started',
      task_code: 'daily_diary',
    });

    expect(result.created).toBe(true);
    expect(eventsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ task_code: 'DAILY_DIARY' }),
    );
  });
});
