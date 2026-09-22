import {
  GUIDELINES_EXECUTE_ORG,
  GUIDELINES_PROJECT,
  GUIDELINES_SCHEMA_VERSION,
  GUIDELINES_SITE,
  GUIDELINES_STUDY,
  GuidelinesActivity,
  GuidelinesDeviceId,
  GuidelinesSubjectFields,
  activityForSessionKind,
  toManausIsoDateTime,
  type GuidelinesSessionKind,
} from './guidelines-dataset.utils';

export type GuidelinesDeviceMeta = {
  device_id: string;
  role: 'dut' | 'reference' | 'benchmark';
  manufacturer: string;
  model: string;
  app_name: string;
  app_version: string;
  app_mode: string | null;
  wear_position: string;
};

const DEVICE_CATALOG: Record<GuidelinesDeviceId, GuidelinesDeviceMeta> = {
  User_Data: {
    device_id: 'User_Data',
    role: 'reference',
    manufacturer: 'UFAM',
    model: 'ClinicalForms',
    app_name: 'PRIME',
    app_version: '1.0.0',
    app_mode: null,
    wear_position: 'not_worn',
  },
  GW8_PrimeInClinic: {
    device_id: 'GW8_PrimeInClinic',
    role: 'dut',
    manufacturer: 'Samsung',
    model: 'SM-L335F',
    app_name: 'PrimeInClinic',
    app_version: '1.1.0',
    app_mode: null,
    wear_position: 'left_wrist',
  },
  GW8_PrimeFreeLiving: {
    device_id: 'GW8_PrimeFreeLiving',
    role: 'dut',
    manufacturer: 'Samsung',
    model: 'SM-L335F',
    app_name: 'PrimeInFreeLiving',
    app_version: '1.0.0',
    app_mode: null,
    wear_position: 'left_wrist',
  },
  GW8_SamsungHealth: {
    device_id: 'GW8_SamsungHealth',
    role: 'dut',
    manufacturer: 'Samsung',
    model: 'SM-L335F',
    app_name: 'SamsungHealth',
    app_version: '1.0.0',
    app_mode: null,
    wear_position: 'left_wrist',
  },
  SP_PrimeInClinic: {
    device_id: 'SP_PrimeInClinic',
    role: 'dut',
    manufacturer: 'Samsung',
    model: 'SM-A566B',
    app_name: 'PrimeInClinic',
    app_version: '1.1.0',
    app_mode: null,
    wear_position: 'not_worn',
  },
  SP_SymptomsDiary: {
    device_id: 'SP_SymptomsDiary',
    role: 'dut',
    manufacturer: 'Samsung',
    model: 'SM-A566B',
    app_name: 'SymptomsDiary',
    app_version: '1.0.0',
    app_mode: null,
    wear_position: 'not_worn',
  },
  Baiobit: {
    device_id: 'Baiobit',
    role: 'reference',
    manufacturer: 'Baiobit',
    model: 'Baiobit',
    app_name: 'Baiobit',
    app_version: '1.0.0',
    app_mode: null,
    wear_position: 'not_worn',
  },
  EMG: {
    device_id: 'EMG',
    role: 'reference',
    manufacturer: 'Delsys',
    model: 'Delsys',
    app_name: 'EMG',
    app_version: '1.0.0',
    app_mode: null,
    wear_position: 'not_worn',
  },
  PSG_Annotations: {
    device_id: 'PSG_Annotations',
    role: 'reference',
    manufacturer: 'PSG',
    model: 'TypeIII',
    app_name: 'PSG',
    app_version: '1.0.0',
    app_mode: null,
    wear_position: 'not_worn',
  },
};

export const buildGuidelinesMetadataJson = (input: {
  sessionId: string;
  sessionKind: GuidelinesSessionKind;
  sessionDateYyyymmdd: string;
  subject: GuidelinesSubjectFields;
  deviceIds: GuidelinesDeviceId[];
  remarks?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}): string => {
  const activity: GuidelinesActivity = activityForSessionKind(input.sessionKind);
  const start =
    input.startTime || toManausIsoDateTime(input.sessionDateYyyymmdd, false);
  const end =
    input.endTime || toManausIsoDateTime(input.sessionDateYyyymmdd, true);

  const devices = input.deviceIds
    .filter((id, idx, arr) => arr.indexOf(id) === idx)
    .map((id) => DEVICE_CATALOG[id])
    .filter(Boolean);

  const payload = {
    schema_version: GUIDELINES_SCHEMA_VERSION,
    study: GUIDELINES_STUDY,
    project: GUIDELINES_PROJECT,
    session: {
      session_id: input.sessionId,
      site: GUIDELINES_SITE,
      activity,
      start_time: start,
      end_time: end,
      execute_organization: GUIDELINES_EXECUTE_ORG,
      remarks: input.remarks ?? null,
    },
    subject: {
      subject_id: input.subject.subject_id,
      age: input.subject.age,
      sex: input.subject.sex,
      height_cm: input.subject.height_cm,
      weight_kg: input.subject.weight_kg,
    },
    devices,
  };

  return `${JSON.stringify(payload, null, 2)}\n`;
};

export { DEVICE_CATALOG };
