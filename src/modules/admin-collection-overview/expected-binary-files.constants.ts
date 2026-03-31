/**
 * Meta de ficheiros por tarefa (CSV/WAV) conforme protocolo PRIME (total 112 sem TA17).
 * Usado para KPIs e formatação da matriz.
 */
export const EXPECTED_BINARY_FILES_TOTAL = 112;

/** Metas por task_code em active_task_definitions */
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
  TA15: 12,
  TA16: 36,
  TA17: 0,
};

export function expectedFilesForTaskCode(taskCode: string): number {
  return EXPECTED_BINARY_FILES_BY_TASK[taskCode] ?? 0;
}

export function sumExpectedForTaskCodes(taskCodes: string[]): number {
  return taskCodes.reduce(
    (sum, code) => sum + expectedFilesForTaskCode(code),
    0,
  );
}
