import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import JSZip = require('jszip');
import { MedicationLabels } from './freeliving-diary.types';

export const DIARY_DOCUMENT_COPIES = 7;

/** A4 paisagem em twips (297 mm × 210 mm). O formulário oficial cabe em uma folha. */
export const A4_LANDSCAPE_WIDTH_TWIPS = '16838';
export const A4_LANDSCAPE_HEIGHT_TWIPS = '11906';

export type DiaryDocumentFill = {
  patientName: string;
  publicIdentifier: string | null;
  cpf?: string | null;
  issuedDate?: string;
  medications: MedicationLabels;
};

const DOCUMENT_XML_PATH = 'word/document.xml';
const DOCUMENT_RELS_PATH = 'word/_rels/document.xml.rels';
const CONTENT_TYPES_PATH = '[Content_Types].xml';
const TEMPLATE_FILE_NAME = 'diario_prime_free_living.docx';
const LOGO_FILE_NAME = 'logoprimeCompleto.png';
const LOGO_REL_ID = 'rIdLogoPrime';
const LOGO_MEDIA_PATH = `word/media/${LOGO_FILE_NAME}`;
const TWIPS_TO_EMU = 635;
const LOGO_PX_WIDTH = 558;
const LOGO_PX_HEIGHT = 227;
/** ~1,4 cm de altura no cabeçalho, para o dia inteiro caber em uma folha A4. */
const LOGO_HEIGHT_TWIPS = 800;
const LOGO_WIDTH_TWIPS = Math.round(
  (LOGO_HEIGHT_TWIPS * LOGO_PX_WIDTH) / LOGO_PX_HEIGHT,
);
const LOGO_CX_EMU = String(LOGO_WIDTH_TWIPS * TWIPS_TO_EMU);
const LOGO_CY_EMU = String(LOGO_HEIGHT_TWIPS * TWIPS_TO_EMU);

const PLACEHOLDERS = {
  dia: '{{DIA}}',
  nome: '{{NOME}}',
  identificador: '{{IDENTIFICADOR}}',
  data: '{{DATA}}',
  cpf: '{{CPF}}',
  m1: '{{M1}}',
  m2: '{{M2}}',
  m3: '{{M3}}',
  m4: '{{M4}}',
  m5: '{{M5}}',
} as const;

const MEDICATION_PLACEHOLDERS = [
  PLACEHOLDERS.m1,
  PLACEHOLDERS.m2,
  PLACEHOLDERS.m3,
  PLACEHOLDERS.m4,
  PLACEHOLDERS.m5,
] as const;

const A4_LANDSCAPE_PGSZ = `<w:pgSz w:w="${A4_LANDSCAPE_WIDTH_TWIPS}" w:h="${A4_LANDSCAPE_HEIGHT_TWIPS}" w:orient="landscape"/>`;
/** Laterais ~1 cm; topo/base mais curtos para a seção 4 não ir para a página seguinte. */
const A4_LANDSCAPE_PGMAR =
  '<w:pgMar w:top="240" w:right="567" w:bottom="80" w:left="567" w:header="0" w:footer="0" w:gutter="0"/>';

export function formatDiaryIssuedDatePt(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(now);
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function extractWordText(xml: string): string {
  const texts: string[] = [];
  const re = /<w:t\b[^>]*>([^<]*)<\/w:t>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml))) {
    texts.push(match[1]);
  }
  return texts.join('');
}

export function countPageBreaks(xml: string): number {
  const explicitBreaks = (xml.match(/<w:br\b[^>]*w:type="page"/g) || []).length;
  const sectionBreaks = (xml.match(/w:val="nextPage"/g) || []).length;
  return explicitBreaks + sectionBreaks;
}

export function applyA4LandscapeSectPr(sectPr: string): string {
  let next = sectPr.trim() || '<w:sectPr></w:sectPr>';
  if (/<w:pgSz\b/.test(next)) {
    next = next.replace(/<w:pgSz\b[^>]*\/>/g, A4_LANDSCAPE_PGSZ);
    next = next.replace(/<w:pgSz\b[^>]*>[\s\S]*?<\/w:pgSz>/g, A4_LANDSCAPE_PGSZ);
  } else {
    next = next.replace(/<w:sectPr\b([^>]*)>/, `<w:sectPr$1>${A4_LANDSCAPE_PGSZ}`);
  }
  if (/<w:pgMar\b/.test(next)) {
    next = next.replace(/<w:pgMar\b[^>]*\/>/g, A4_LANDSCAPE_PGMAR);
    next = next.replace(/<w:pgMar\b[^>]*>[\s\S]*?<\/w:pgMar>/g, A4_LANDSCAPE_PGMAR);
  } else {
    next = next.replace(
      A4_LANDSCAPE_PGSZ,
      `${A4_LANDSCAPE_PGSZ}${A4_LANDSCAPE_PGMAR}`,
    );
  }
  return next;
}

function withNextPageSectionType(sectPr: string): string {
  let next = applyA4LandscapeSectPr(sectPr);
  if (/<w:type\b/.test(next)) {
    next = next.replace(/<w:type\b[^>]*\/>/g, '<w:type w:val="nextPage"/>');
    next = next.replace(
      /<w:type\b[^>]*>[\s\S]*?<\/w:type>/g,
      '<w:type w:val="nextPage"/>',
    );
  } else {
    next = next.replace(
      /<w:sectPr\b([^>]*)>/,
      `<w:sectPr$1><w:type w:val="nextPage"/>`,
    );
  }
  return next;
}

function sectionBreakParagraph(sectPr: string): string {
  return `<w:p><w:pPr>${withNextPageSectionType(sectPr)}</w:pPr></w:p>`;
}

function insertPlaceholderOnce(
  xml: string,
  placeholder: string,
  labelRe: RegExp,
  insertAfter?: RegExp,
): string {
  if (xml.includes(placeholder)) return xml;
  return xml.replace(labelRe, (full, open: string, inner: string, close: string) => {
    if (inner.includes(placeholder)) return full;
    const patched = insertAfter
      ? inner.replace(insertAfter, (token) => `${token} ${placeholder}`)
      : `${inner} ${placeholder}`;
    if (patched === inner) {
      return `${open}${inner} ${placeholder}${close}`;
    }
    return `${open}${patched}${close}`;
  });
}

function insertAfterFirstWt(xml: string, snippet: string): string {
  return xml.replace(
    /(<w:t\b[^>]*>)([^<]*)(<\/w:t>)/,
    (_full, open: string, inner: string, close: string) =>
      `${open}${inner}${snippet}${close}`,
  );
}

function unfloatTables(xml: string): string {
  return xml
    .replace(/<w:tblpPr\b[^/]*\/>/g, '')
    .replace(/<w:tblpPr\b[^>]*>[\s\S]*?<\/w:tblpPr>/g, '')
    .replace(/<w:tblOverlap\b[^/]*\/>/g, '')
    .replace(/<w:tblOverlap\b[^>]*>[\s\S]*?<\/w:tblOverlap>/g, '');
}

/** Encaixa identificação, medicação e atividades na área útil do A4 paisagem. */
function fitOfficialLayoutToA4(xml: string): string {
  let next = xml.replace(
    /<w:tblInd w:w="-3501" w:type="dxa"\/>/g,
    '<w:tblInd w:w="0" w:type="dxa"/>',
  );
  next = next.replace(/<w:ind w:left="3495"\/>/g, '<w:ind w:left="120"/>');
  next = next.replace(/<w:ind w:left="3637"\/>/g, '<w:ind w:left="120"/>');
  next = next.replace(
    /<w:tblLayout w:type="fixed"\/>/g,
    '<w:tblLayout w:type="autofit"/>',
  );
  next = next.replace(
    /<w:tblW w:w="0" w:type="auto"\/>/g,
    '<w:tblW w:w="5000" w:type="pct"/>',
  );

  const usableWidth = 16838 - 567 - 567;
  const originalMainWidth = 19513;
  const factor = usableWidth / originalMainWidth;
  const widthsToScale = [
    10305, 9083, 8076, 5314, 5191, 4267, 4182, 3894, 3847, 2417, 2276, 2127,
  ];
  for (const width of widthsToScale) {
    const scaled = Math.max(240, Math.round(width * factor));
    next = next.split(`w:w="${width}"`).join(`w:w="${scaled}"`);
  }
  return next;
}

/** Compacta o ritmo vertical para um dia = uma página A4 paisagem. */
function compactDiaryVerticalRhythm(xml: string): string {
  let next = xml.replace(/w:line="240"/g, 'w:line="200"');
  next = next.replace(/<w:trHeight w:val="331"\/>/g, '<w:trHeight w:val="250"/>');
  next = next.replace(/<w:trHeight w:val="288"\/>/g, '<w:trHeight w:val="220"/>');
  return next;
}

function keepSection4WithTable(xml: string): string {
  const marker = xml.indexOf('xml:space="preserve">4. </w:t>');
  if (marker < 0) return xml;
  const pStart = lastParagraphStart(xml, marker);
  if (pStart < 0) return xml;
  const pPrClose = xml.indexOf('</w:pPr>', pStart);
  if (pPrClose < 0 || pPrClose > marker) return xml;
  const head = xml.slice(pStart, pPrClose);
  if (head.includes('keepNext')) return xml;
  return `${xml.slice(0, pPrClose)}<w:keepNext/>${xml.slice(pPrClose)}`;
}

function occupyLogoReservedSpace(xml: string): string {
  return xml.replace(
    /<w:trPr>\s*<w:gridBefore w:val="1"\/>\s*<w:wBefore w:w="(\d+)" w:type="dxa"\/>\s*<\/w:trPr>\s*<w:tc>\s*<w:tcPr>\s*<w:tcW w:w="(\d+)" w:type="dxa"\/>/,
    (_full, before: string, cell: string) => {
      const width = Number(before) + Number(cell);
      return (
        `<w:trPr></w:trPr><w:tc><w:tcPr><w:gridSpan w:val="2"/>` +
        `<w:tcW w:w="${width}" w:type="dxa"/>`
      );
    },
  );
}

function logoDrawingXml(relId: string): string {
  return (
    `<w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">` +
    `<wp:extent cx="${LOGO_CX_EMU}" cy="${LOGO_CY_EMU}"/>` +
    `<wp:effectExtent l="0" t="0" r="0" b="0"/>` +
    `<wp:docPr id="90" name="Logo PRIME"/>` +
    `<wp:cNvGraphicFramePr>` +
    `<a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>` +
    `</wp:cNvGraphicFramePr>` +
    `<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">` +
    `<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
    `<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
    `<pic:nvPicPr>` +
    `<pic:cNvPr id="0" name="${LOGO_FILE_NAME}"/>` +
    `<pic:cNvPicPr><pic:picLocks noChangeAspect="1"/></pic:cNvPicPr>` +
    `</pic:nvPicPr>` +
    `<pic:blipFill>` +
    `<a:blip r:embed="${relId}"/>` +
    `<a:stretch><a:fillRect/></a:stretch>` +
    `</pic:blipFill>` +
    `<pic:spPr>` +
    `<a:xfrm><a:off x="0" y="0"/><a:ext cx="${LOGO_CX_EMU}" cy="${LOGO_CY_EMU}"/></a:xfrm>` +
    `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>` +
    `</pic:spPr>` +
    `</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing>`
  );
}

export function replacePrimeHeaderWithLogo(
  xml: string,
  relId: string = LOGO_REL_ID,
): string {
  const marker = '<w:t>PRIME</w:t>';
  const markerAt = xml.indexOf(marker);
  if (markerAt < 0) return xml;
  const pStartAttr = xml.lastIndexOf('<w:p ', markerAt);
  const pStartBare = xml.lastIndexOf('<w:p>', markerAt);
  const pStart = Math.max(pStartAttr, pStartBare);
  const pEnd = xml.indexOf('</w:p>', markerAt);
  if (pStart < 0 || pEnd < 0) return xml;
  const paragraph = xml.slice(pStart, pEnd + 6);
  const pPrMatch = paragraph.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
  const pPr = pPrMatch?.[0] ?? '<w:pPr><w:spacing w:after="0"/></w:pPr>';
  const replaced = `<w:p>${pPr}<w:r>${logoDrawingXml(relId)}</w:r></w:p>`;
  return xml.slice(0, pStart) + replaced + xml.slice(pEnd + 6);
}

function ensurePngContentType(xml: string): string {
  if (/Extension="png"/i.test(xml)) return xml;
  return xml.replace(
    /<Types\b[^>]*>/,
    (open) =>
      `${open}<Default Extension="png" ContentType="image/png"/>`,
  );
}

function ensureLogoRelationship(xml: string, relId: string): string {
  if (xml.includes(`Id="${relId}"`)) return xml;
  const relationship =
    `<Relationship Id="${relId}" ` +
    `Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" ` +
    `Target="media/${LOGO_FILE_NAME}"/>`;
  if (xml.includes('</Relationships>')) {
    return xml.replace('</Relationships>', `${relationship}</Relationships>`);
  }
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `${relationship}</Relationships>`
  );
}

function fillOfficialIdentityBlanks(xml: string): string {
  let next = xml.replace(
    '<w:ind w:left="2394" w:right="-2467"/>',
    '<w:ind w:left="60" w:right="60"/>',
  );
  next = next.replace(
    /(<w:t>Identificador<\/w:t><\/w:r>[\s\S]{0,240}?<w:t>): ____________________(<\/w:t>)/,
    `$1: ${PLACEHOLDERS.identificador}$2`,
  );
  next = next.replace(
    /(<w:t>)_____________________________(<\/w:t>)/,
    `$1${PLACEHOLDERS.nome}$2`,
  );
  next = next.replace(
    /(Data: )____\/____\/______/,
    `$1${PLACEHOLDERS.data}`,
  );
  next = next.replace(
    /(<w:t>Dia<\/w:t><\/w:r>[\s\S]{0,240}?<w:t>): ____\/7(<\/w:t>)/,
    `$1: ${PLACEHOLDERS.dia}/7$2`,
  );
  return next;
}

function fillOfficialMedicationCells(xml: string): string {
  const marker = '>Medicamento</w:t>';
  const start = xml.indexOf(marker);
  if (start < 0) return xml;

  const emptyNameCell =
    /(<w:tcW w:w="(?:1555|3200)"[^/]*\/>(?:(?!<\/w:tc>)[\s\S])*?<w:pPr>(?:(?!<\/w:pPr>)[\s\S])*<\/w:pPr>)\s*(<\/w:p>\s*<\/w:tc>)/;

  let next = xml;
  let searchFrom = start;
  for (const key of MEDICATION_PLACEHOLDERS) {
    const slice = next.slice(searchFrom);
    const match = slice.match(emptyNameCell);
    if (!match || match.index == null) break;
    const pPr = match[1].replace(
      /<w:jc w:val="center"\/>/,
      '<w:jc w:val="left"/>',
    );
    const run =
      `<w:r><w:rPr><w:sz w:val="14"/><w:szCs w:val="14"/></w:rPr>` +
      `<w:t xml:space="preserve">${key}</w:t></w:r>`;
    const replacement = `${pPr}${run}${match[2]}`;
    const abs = searchFrom + match.index;
    next =
      next.slice(0, abs) + replacement + next.slice(abs + match[0].length);
    searchFrom = abs + replacement.length;
  }
  return next;
}

/** Word usa meio-ponto: 20 = 10 pt. */
const SECTION_2_FONT_HALF_POINTS = '20';

function lastParagraphStart(xml: string, from: number): number {
  return Math.max(xml.lastIndexOf('<w:p ', from), xml.lastIndexOf('<w:p>', from));
}

export function applySection2FontSize(xml: string): string {
  const startMarker = xml.indexOf('xml:space="preserve">2. </w:t>');
  if (startMarker < 0) return xml;
  const endMarker = xml.indexOf('>3. Sintomas', startMarker);
  if (endMarker < 0) return xml;
  const start = lastParagraphStart(xml, startMarker);
  const end = lastParagraphStart(xml, endMarker);
  if (start < 0 || end <= start) return xml;
  const section = xml.slice(start, end);
  const patched = section
    .replace(
      /<w:sz w:val="\d+"\/>/g,
      `<w:sz w:val="${SECTION_2_FONT_HALF_POINTS}"/>`,
    )
    .replace(
      /<w:szCs w:val="\d+"\/>/g,
      `<w:szCs w:val="${SECTION_2_FONT_HALF_POINTS}"/>`,
    );
  return xml.slice(0, start) + patched + xml.slice(end);
}

export function prepareDiaryTemplateXml(xml: string): string {
  let next = unfloatTables(xml);
  next = fitOfficialLayoutToA4(next);
  next = occupyLogoReservedSpace(next);
  next = replacePrimeHeaderWithLogo(next);
  next = fillOfficialIdentityBlanks(next);
  next = fillOfficialMedicationCells(next);
  next = applySection2FontSize(next);
  next = compactDiaryVerticalRhythm(next);
  next = keepSection4WithTable(next);

  next = insertPlaceholderOnce(
    next,
    PLACEHOLDERS.m1,
    /(<w:t\b[^>]*>)([^<]*\bM1\b:?[^<]*)(<\/w:t>)/,
    /\bM1\b:?/,
  );
  next = insertPlaceholderOnce(
    next,
    PLACEHOLDERS.m2,
    /(<w:t\b[^>]*>)([^<]*\bM2\b:?[^<]*)(<\/w:t>)/,
    /\bM2\b:?/,
  );
  next = insertPlaceholderOnce(
    next,
    PLACEHOLDERS.m3,
    /(<w:t\b[^>]*>)([^<]*\bM3\b:?[^<]*)(<\/w:t>)/,
    /\bM3\b:?/,
  );
  next = insertPlaceholderOnce(
    next,
    PLACEHOLDERS.m4,
    /(<w:t\b[^>]*>)([^<]*\bM4\b:?[^<]*)(<\/w:t>)/,
    /\bM4\b:?/,
  );
  next = insertPlaceholderOnce(
    next,
    PLACEHOLDERS.m5,
    /(<w:t\b[^>]*>)([^<]*\bM5\b:?[^<]*)(<\/w:t>)/,
    /\bM5\b:?/,
  );
  next = insertPlaceholderOnce(
    next,
    PLACEHOLDERS.nome,
    /(<w:t\b[^>]*>)([^<]*\bNome\b[^<]*)(<\/w:t>)/i,
    /\bNome\b:?/i,
  );
  next = insertPlaceholderOnce(
    next,
    PLACEHOLDERS.identificador,
    /(<w:t\b[^>]*>)([^<]*Identificador[^<]*)(<\/w:t>)/i,
    /Identificador:?/i,
  );
  next = insertPlaceholderOnce(
    next,
    PLACEHOLDERS.data,
    /(<w:t\b[^>]*>)([^<]*\bData\b[^<]*)(<\/w:t>)/i,
    /\bData\b:?/i,
  );
  next = insertPlaceholderOnce(
    next,
    PLACEHOLDERS.cpf,
    /(<w:t\b[^>]*>)([^<]*\bCPF\b[^<]*)(<\/w:t>)/i,
    /\bCPF\b:?/i,
  );
  next = insertPlaceholderOnce(
    next,
    PLACEHOLDERS.dia,
    /(<w:t\b[^>]*>)([^<]*\bDia\b[^<]*)(<\/w:t>)/i,
    /\bDia\b:?/i,
  );

  const missing: string[] = [];
  if (!next.includes(PLACEHOLDERS.dia)) missing.push(` Dia ${PLACEHOLDERS.dia}/7`);
  if (!next.includes(PLACEHOLDERS.nome)) missing.push(` ${PLACEHOLDERS.nome}`);
  if (!next.includes(PLACEHOLDERS.identificador)) {
    missing.push(` ${PLACEHOLDERS.identificador}`);
  }
  if (!next.includes(PLACEHOLDERS.data)) missing.push(` Data ${PLACEHOLDERS.data}`);
  if (!next.includes(PLACEHOLDERS.m1)) missing.push(` M1 ${PLACEHOLDERS.m1}`);
  if (!next.includes(PLACEHOLDERS.m2)) missing.push(` M2 ${PLACEHOLDERS.m2}`);
  if (!next.includes(PLACEHOLDERS.m3)) missing.push(` M3 ${PLACEHOLDERS.m3}`);
  if (!next.includes(PLACEHOLDERS.m4)) missing.push(` M4 ${PLACEHOLDERS.m4}`);
  if (!next.includes(PLACEHOLDERS.m5)) missing.push(` M5 ${PLACEHOLDERS.m5}`);
  if (missing.length > 0) {
    next = insertAfterFirstWt(next, missing.join(''));
  }
  return next;
}

export function fillDiaryCopyXml(
  xml: string,
  protocolDay: number,
  data: DiaryDocumentFill,
): string {
  const med = data.medications;
  const replacements: Array<[string, string]> = [
    [PLACEHOLDERS.dia, String(protocolDay)],
    [PLACEHOLDERS.nome, data.patientName || ''],
    [PLACEHOLDERS.identificador, data.publicIdentifier || ''],
    [PLACEHOLDERS.data, data.issuedDate || formatDiaryIssuedDatePt()],
    [PLACEHOLDERS.cpf, data.cpf || ''],
    [PLACEHOLDERS.m1, med.m1 || ''],
    [PLACEHOLDERS.m2, med.m2 || ''],
    [PLACEHOLDERS.m3, med.m3 || ''],
    [PLACEHOLDERS.m4, med.m4 || ''],
    [PLACEHOLDERS.m5, med.m5 || ''],
  ];
  let next = xml;
  for (const [token, value] of replacements) {
    next = next.split(token).join(escapeXml(value));
  }
  return next;
}

function splitBody(xml: string): { before: string; inner: string; after: string } {
  const match = xml.match(/<w:body\b[^>]*>/);
  if (!match || match.index == null) {
    throw new Error('document.xml sem w:body');
  }
  const start = match.index + match[0].length;
  const end = xml.lastIndexOf('</w:body>');
  if (end < 0) {
    throw new Error('document.xml sem fechamento de w:body');
  }
  return {
    before: xml.slice(0, start),
    inner: xml.slice(start, end),
    after: xml.slice(end),
  };
}

function splitSectPr(inner: string): { content: string; sectPr: string } {
  const match = inner.match(/<w:sectPr\b[\s\S]*<\/w:sectPr>\s*$/);
  if (!match) {
    return { content: inner, sectPr: '' };
  }
  return {
    content: inner.slice(0, match.index),
    sectPr: match[0],
  };
}

export function duplicateDiaryBodyXml(
  xml: string,
  copies: number,
  fillCopy: (content: string, protocolDay: number) => string,
): string {
  const { before, inner, after } = splitBody(xml);
  const { content, sectPr } = splitSectPr(inner);
  const baseSectPr = applyA4LandscapeSectPr(sectPr || '<w:sectPr></w:sectPr>');
  const parts: string[] = [];
  for (let day = 1; day <= copies; day += 1) {
    parts.push(fillCopy(content, day));
    if (day < copies) parts.push(sectionBreakParagraph(baseSectPr));
  }
  return `${before}${parts.join('')}${baseSectPr}${after}`;
}

export function resolvePrimeLogoPath(): string | null {
  const assetsDir = join(__dirname, 'assets');
  const assetsPath = join(assetsDir, LOGO_FILE_NAME);
  const originals = [
    join(__dirname, '../../../../prime/public', LOGO_FILE_NAME),
    join(process.cwd(), '../../prime/public', LOGO_FILE_NAME),
    join(process.cwd(), '../prime/public', LOGO_FILE_NAME),
    join(process.cwd(), 'prime/public', LOGO_FILE_NAME),
  ];
  if (!existsSync(assetsPath)) {
    const original = originals.find((candidate) => existsSync(candidate));
    if (original) {
      try {
        mkdirSync(assetsDir, { recursive: true });
        copyFileSync(original, assetsPath);
      } catch {
        return original;
      }
    }
  }
  const candidates = [
    assetsPath,
    join(process.cwd(), 'src/modules/freeliving/assets', LOGO_FILE_NAME),
    join(process.cwd(), 'dist/modules/freeliving/assets', LOGO_FILE_NAME),
    ...originals,
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

export function resolveDiaryTemplatePath(): string {
  const assetsDir = join(__dirname, 'assets');
  const assetsPath = join(assetsDir, TEMPLATE_FILE_NAME);
  const originals = [
    join(__dirname, '../../../../diario_prime_free_living_formulario_revisado_final.docx'),
    join(process.cwd(), '../../diario_prime_free_living_formulario_revisado_final.docx'),
    join(process.cwd(), 'diario_prime_free_living_formulario_revisado_final.docx'),
  ];
  if (!existsSync(assetsPath)) {
    const original = originals.find((candidate) => existsSync(candidate));
    if (original) {
      try {
        mkdirSync(assetsDir, { recursive: true });
        copyFileSync(original, assetsPath);
      } catch {
        return original;
      }
    }
  }
  const candidates = [
    assetsPath,
    join(process.cwd(), 'src/modules/freeliving/assets', TEMPLATE_FILE_NAME),
    join(process.cwd(), 'dist/modules/freeliving/assets', TEMPLATE_FILE_NAME),
    ...originals,
  ];
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error(
      'Template do diário Free Living não encontrado (diario_prime_free_living.docx)',
    );
  }
  return found;
}

export function diaryDocumentFileName(
  patientName: string,
  publicIdentifier?: string | null,
): string {
  const id = (publicIdentifier || '').trim() || 'paciente';
  const slug = (patientName || 'diario')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);
  return `diario_free_living_${id}_${slug}_7dias.docx`;
}

export async function buildFreelivingDiaryDocument(
  data: DiaryDocumentFill,
  templateBuffer?: Buffer,
): Promise<{ buffer: Buffer; fileName: string }> {
  const buffer =
    templateBuffer ?? readFileSync(resolveDiaryTemplatePath());
  const zip = await JSZip.loadAsync(buffer);
  const documentFile = zip.file(DOCUMENT_XML_PATH);
  if (!documentFile) {
    throw new Error('Template DOCX inválido: falta word/document.xml');
  }
  const originalXml = await documentFile.async('string');
  const fillData: DiaryDocumentFill = {
    ...data,
    issuedDate: data.issuedDate || formatDiaryIssuedDatePt(),
  };
  const prepared = prepareDiaryTemplateXml(originalXml);
  const filled = duplicateDiaryBodyXml(
    prepared,
    DIARY_DOCUMENT_COPIES,
    (content, protocolDay) =>
      fillDiaryCopyXml(
        content.replace(
          '<wp:docPr id="90"',
          `<wp:docPr id="${90 + protocolDay}"`,
        ),
        protocolDay,
        fillData,
      ),
  );
  zip.file(DOCUMENT_XML_PATH, filled);

  const logoPath = resolvePrimeLogoPath();
  if (logoPath && prepared.includes(`r:embed="${LOGO_REL_ID}"`)) {
    zip.file(LOGO_MEDIA_PATH, readFileSync(logoPath));
    const contentTypesFile = zip.file(CONTENT_TYPES_PATH);
    if (contentTypesFile) {
      zip.file(
        CONTENT_TYPES_PATH,
        ensurePngContentType(await contentTypesFile.async('string')),
      );
    }
    const relsFile = zip.file(DOCUMENT_RELS_PATH);
    zip.file(
      DOCUMENT_RELS_PATH,
      ensureLogoRelationship(
        relsFile ? await relsFile.async('string') : '',
        LOGO_REL_ID,
      ),
    );
  }
  const output = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });
  return {
    buffer: output as Buffer,
    fileName: diaryDocumentFileName(data.patientName, data.publicIdentifier),
  };
}

export async function createMinimalDiaryTemplate(options?: {
  includeLabels?: boolean;
}): Promise<Buffer> {
  const includeLabels = options?.includeLabels !== false;
    const labels = includeLabels
    ? 'Nome Identificador CPF Data Dia M1 M2 M3 M4 M5'
    : 'Formulario Free Living';
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>${labels}</w:t></w:r></w:p>
    <w:sectPr>${A4_LANDSCAPE_PGSZ}</w:sectPr>
  </w:body>
</w:document>`;
  const zip = new JSZip();
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
  );
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
  );
  zip.file(DOCUMENT_XML_PATH, documentXml);
  return zip.generateAsync({ type: 'nodebuffer' }) as Promise<Buffer>;
}
