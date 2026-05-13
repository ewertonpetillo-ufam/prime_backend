/**
 * Meta de ficheiros por tarefa (CSV/WAV) conforme protocolo PRIME.
 * TA15: até 8 ficheiros por paciente (antes 12). Usado para KPIs e formatação da matriz.
 */
export const EXPECTED_BINARY_FILES_BY_TASK: Record<string, number> = {
  TA1: 4,
  TA2: 4,
  TA3: 4,
  TA4: 4,
  TA5: 12,
  TA6: 1,
  TA7: 1,
  TA8: 2,
  TA9: 1,
  TA10: 4,
  TA11: 6,
  TA12: 6,
  TA13: 3,
  TA14: 12,
  TA15: 8,
  TA16: 36,
  TA17: 0,
};

/** Total de ficheiros binários esperados por paciente (soma das metas por TA). */
export const EXPECTED_BINARY_FILES_TOTAL = Object.values(
  EXPECTED_BINARY_FILES_BY_TASK,
).reduce((sum, n) => sum + n, 0);

export function expectedFilesForTaskCode(taskCode: string): number {
  return EXPECTED_BINARY_FILES_BY_TASK[taskCode] ?? 0;
}

export function sumExpectedForTaskCodes(taskCodes: string[]): number {
  return taskCodes.reduce(
    (sum, code) => sum + expectedFilesForTaskCode(code),
    0,
  );
}

/**
 * Estágios de protocolo PRIME (alinhamento operacional ao painel de coleta).
 * In-clinic: todas as TAs ativas exceto sono (TA13) e exceto estágio «livre» ainda não mapeado.
 * Sleep: TA13. «Free-living» / fora do consultório: reservado — preencher códigos quando existir meta e nomenclatura.
 */
export type CollectionProtocolStage = 'in_clinic' | 'sleep' | 'free_living';

/** TAs do protocolo fora do consultório (antigo free-living). Lista vazia até implementação e nomenclatura definitivas. */
export const FREE_LIVING_PROTOCOL_TASK_CODES: string[] = [];

export function collectionProtocolStageForTaskCode(
  taskCode: string,
): CollectionProtocolStage {
  if (taskCode === 'TA13') return 'sleep';
  if (FREE_LIVING_PROTOCOL_TASK_CODES.includes(taskCode)) return 'free_living';
  return 'in_clinic';
}

export function taskCodesInProtocolStage(
  stage: CollectionProtocolStage,
  taskCodes: string[],
): string[] {
  return taskCodes.filter(
    (c) => collectionProtocolStageForTaskCode(c) === stage,
  );
}
