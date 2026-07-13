import { samsungPdfReportDataPath } from '../samsung-sync/samsung-dataset.utils';

/**
 * Estrutura UFAM/PRIME (download em massa) — diferente do SAMSUNG (UFAMPRIME-Dataset/...).
 *
 * Dados_Todos_Pacientes.zip
 * └── {public_identifier}_{hashCPF8}/
 *     ├── 01_Demographic_Anthropometric_Clinical_Data.csv
 *     ├── 02_Neurological_Assessment.csv
 *     ├── 03_Speech_Therapy_Assessment.csv
 *     ├── 04_Sleep_Assessment.csv
 *     ├── 05_Physiotherapy_Assessment.csv
 *     ├── Clinic|Sleep/{Baiobit|EMG|PSG|Ring}/relatorio.pdf
 *     └── Active_Tasks/{arquivos de coleta}
 */

export type ExportPrimePdfType = 'BIOBIT' | 'DELSYS' | 'POLYSOMNOGRAPHY';

export interface ExportPrimeSelectiveFilters {
  includeClinicalQuestionnaires?: boolean;
  includeSleepQuestionnaires?: boolean;
  taskCodes?: string[];
  pdfTypes?: ExportPrimePdfType[];
  /**
   * Quando true (Baixar todos):
   * - Sono: só pacientes com TA13
   * - Clínico: só pacientes com alguma TA clínica (≠ TA13)
   */
  onlyPatientsWithTaskData?: boolean;
  requireSleepTa13?: boolean;
  requireAnyClinicalTask?: boolean;
}

/** True quando o request pede export filtrado (não o ZIP completo legado). */
export function isSelectivePrimeExport(
  filters: ExportPrimeSelectiveFilters,
): boolean {
  return (
    filters.includeClinicalQuestionnaires !== undefined ||
    filters.includeSleepQuestionnaires !== undefined ||
    filters.taskCodes !== undefined ||
    filters.pdfTypes !== undefined
  );
}

export function resolvePrimeZipName(filters: ExportPrimeSelectiveFilters): string {
  if (!isSelectivePrimeExport(filters)) {
    return 'Dados_Todos_Pacientes.zip';
  }

  const hasClinic =
    filters.includeClinicalQuestionnaires === true ||
    (filters.taskCodes?.some((c) => c.toUpperCase() !== 'TA13') ?? false) ||
    (filters.pdfTypes?.some((t) => t === 'BIOBIT' || t === 'DELSYS') ?? false);
  const hasSleep =
    filters.includeSleepQuestionnaires === true ||
    (filters.taskCodes?.some((c) => c.toUpperCase() === 'TA13') ?? false) ||
    (filters.pdfTypes?.includes('POLYSOMNOGRAPHY') ?? false);

  if (hasClinic && !hasSleep) return 'Dados_Clinicos.zip';
  if (hasSleep && !hasClinic) return 'Dados_Sono.zip';
  return 'Dados_Selecionados.zip';
}

/** PDFs no ZIP UFAM/PRIME: Clinic|Sleep/{device}/... */
export const ufamPrimePdfReportZipPath = (reportType: string | undefined): string => {
  const { protocol, device } = samsungPdfReportDataPath(reportType);
  return `${protocol}/${device}`;
};

/** Hash curto do CPF para pasta — alinhado ao frontend (gerarHashCPF). */
export const gerarHashCPFSimples = (cpf: string): string => {
  const cpfLimpo = (cpf || '').replace(/\D/g, '');
  let hash = 0;
  for (let i = 0; i < cpfLimpo.length; i++) {
    const char = cpfLimpo.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash;
  }
  return Math.abs(hash).toString(16).substring(0, 8).toUpperCase();
};

/** Anonimiza prefixo CPF no nome do arquivo — alinhado ao frontend. */
export const anonimizarCpfNoFilename = (fileName: string, cpfHash: string): string => {
  const shortHash = (cpfHash || '').substring(0, 8);
  if (!fileName) return shortHash;
  const idx = fileName.indexOf('_');
  if (idx === -1) return `${shortHash}_${fileName}`;
  return `${shortHash}_${fileName.substring(idx + 1)}`;
};

export const buildUfamPatientFolderName = (
  publicIdentifier: string | null | undefined,
  cpf: string | null | undefined,
): string => {
  const patientIdentifier = (publicIdentifier || 'Paciente').trim();
  const cpfHashForFolder = gerarHashCPFSimples(cpf || '');
  return `${patientIdentifier}_${cpfHashForFolder}`;
};

/** Mesma regra do getUniqueFilename em busca-questionarios/page.tsx */
export const getUniqueFilenameUfam = (
  baseName: string,
  counterMap: Map<string, number>,
  scopePrefix = '',
): string => {
  const safeBaseName = baseName && baseName.trim() !== '' ? baseName.trim() : 'file';
  const dotIndex = safeBaseName.lastIndexOf('.');
  const name = dotIndex > 0 ? safeBaseName.slice(0, dotIndex) : safeBaseName;
  const ext = dotIndex > 0 ? safeBaseName.slice(dotIndex) : '';

  const countKey = scopePrefix ? `${scopePrefix}/${safeBaseName}` : safeBaseName;
  const current = (counterMap.get(countKey) || 0) + 1;
  counterMap.set(countKey, current);

  if (current === 1) return safeBaseName;
  return `${name}(${current})${ext}`;
};
