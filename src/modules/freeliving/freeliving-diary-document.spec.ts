import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import JSZip = require('jszip');
import {
  buildFreelivingDiaryDocument,
  countPageBreaks,
  createMinimalDiaryTemplate,
  A4_LANDSCAPE_HEIGHT_TWIPS,
  A4_LANDSCAPE_WIDTH_TWIPS,
  DIARY_DOCUMENT_COPIES,
  diaryDocumentFileName,
  extractWordText,
  fillDiaryCopyXml,
  prepareDiaryTemplateXml,
  replacePrimeHeaderWithLogo,
  applySection2FontSize,
} from './freeliving-diary-document';
import { formatMedicationLabel, mapMedicationRows } from './freeliving-clinical-medications';

describe('freeliving-clinical-medications', () => {
  it('formata rótulo com dose', () => {
    expect(formatMedicationLabel('Levodopa / Carbidopa', 100)).toBe(
      'Levodopa / Carbidopa 100 mg',
    );
  });

  it('limita a 5 medicamentos e conta o excedente', () => {
    const rows = Array.from({ length: 7 }, (_, index) => ({
      drug_name: `Med ${index + 1}`,
      dose_mg: 50,
      doses_per_day: 3,
    }));
    const mapped = mapMedicationRows(rows);
    expect(mapped.slots).toHaveLength(5);
    expect(mapped.extraCount).toBe(2);
    expect(mapped.slots[0].label).toBe('Med 1 50 mg');
  });
});

describe('freeliving-diary-document', () => {
  beforeAll(() => {
    const src = join(
      process.cwd(),
      '../../diario_prime_free_living_formulario_revisado_final.docx',
    );
    const destDir = join(process.cwd(), 'src/modules/freeliving/assets');
    const dest = join(destDir, 'diario_prime_free_living.docx');
    if (existsSync(src) && !existsSync(dest)) {
      mkdirSync(destDir, { recursive: true });
      copyFileSync(src, dest);
    }
  });
  it('prepara placeholders a partir dos rótulos do formulário', () => {
    const xml = `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Nome Identificador Dia M1 M2 M3 M4 M5</w:t></w:r></w:p><w:sectPr></w:sectPr></w:body></w:document>`;
    const prepared = prepareDiaryTemplateXml(xml);
    expect(prepared).toContain('{{NOME}}');
    expect(prepared).toContain('{{IDENTIFICADOR}}');
    expect(prepared).toContain('{{DIA}}');
    expect(prepared).toContain('Dia {{DIA}}');
    expect(prepared).toContain('{{M1}}');
    expect(prepared).toContain('{{M5}}');
    expect(prepared).not.toContain('Participante {{NOME}}');
  });

  it('substitui o texto PRIME do cabeçalho pela logo', () => {
    const xml =
      '<w:p><w:r><w:t>PRIME</w:t></w:r><w:r><w:t>Pesquisa e Inovação</w:t></w:r></w:p>' +
      '<w:p><w:r><w:t>Diário do Participante - Free-Living PRIME</w:t></w:r></w:p>';
    const next = replacePrimeHeaderWithLogo(xml);
    expect(next).not.toContain('<w:t>PRIME</w:t>');
    expect(next).not.toContain('Pesquisa e Inovação');
    expect(next).toContain('r:embed="rIdLogoPrime"');
    expect(next).toContain('logoprimeCompleto.png');
    expect(next).toContain('Diário do Participante - Free-Living PRIME');
  });

  it('aplica fonte 10pt na seção 2 de atividades', () => {
    const xml =
      '<w:p><w:r><w:rPr><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>' +
      '<w:t xml:space="preserve">2. </w:t></w:r>' +
      '<w:r><w:t>Atividades</w:t></w:r></w:p>' +
      '<w:p><w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>Higiene da manhã</w:t></w:r></w:p>' +
      '<w:p><w:r><w:rPr><w:sz w:val="20"/></w:rPr>' +
      '<w:t xml:space="preserve">3. Sintomas </w:t></w:r></w:p>';
    const next = applySection2FontSize(xml);
    const section2 = next.slice(
      0,
      next.indexOf('>3. Sintomas'),
    );
    expect(section2).toContain('w:sz w:val="20"');
    expect(section2).toContain('w:szCs w:val="20"');
    expect(section2).not.toContain('w:sz w:val="18"');
    expect(section2).not.toContain('w:sz w:val="24"');
    expect(next).toContain('xml:space="preserve">3. Sintomas </w:t>');
  });

  it('preenche uma via sem alterar o restante do XML', () => {
    const filled = fillDiaryCopyXml('Dia {{DIA}} Nome {{NOME}} M1 {{M1}}', 3, {
      patientName: 'Ana Silva',
      publicIdentifier: 'P001',
      cpf: '123',
      medications: {
        m1: 'Levodopa 100 mg',
        m2: null,
        m3: null,
        m4: null,
        m5: null,
      },
    });
    expect(filled).toBe('Dia 3 Nome Ana Silva M1 Levodopa 100 mg');
  });

  it('gera 7 vias com quebra de página e medicamentos preenchidos', async () => {
    const template = await createMinimalDiaryTemplate();
    const { buffer, fileName } = await buildFreelivingDiaryDocument(
      {
        patientName: 'João da Silva',
        publicIdentifier: 'P042',
        cpf: '52998224725',
        medications: {
          m1: 'Levodopa / Carbidopa 100 mg',
          m2: 'Rasagilina 1 mg',
          m3: null,
          m4: null,
          m5: null,
        },
      },
      template,
    );

    expect(fileName).toContain('P042');
    expect(fileName.endsWith('.docx')).toBe(true);

    const zip = await JSZip.loadAsync(buffer);
    const xml = await zip.file('word/document.xml')!.async('string');
    const text = extractWordText(xml);

    expect(countPageBreaks(xml)).toBe(DIARY_DOCUMENT_COPIES - 1);
    expect((xml.match(/w:val="nextPage"/g) || []).length).toBe(
      DIARY_DOCUMENT_COPIES - 1,
    );
    expect(xml).toContain(`w:w="${A4_LANDSCAPE_WIDTH_TWIPS}"`);
    expect(xml).toContain(`w:h="${A4_LANDSCAPE_HEIGHT_TWIPS}"`);
    expect(xml).toContain('w:orient="landscape"');
    expect((text.match(/Dia 1/g) || []).length).toBeGreaterThanOrEqual(1);
    expect((text.match(/Dia 7/g) || []).length).toBeGreaterThanOrEqual(1);
    expect((text.match(/João da Silva/g) || []).length).toBe(DIARY_DOCUMENT_COPIES);
    expect(text).toContain('Levodopa / Carbidopa 100 mg');
    expect(text).toContain('Rasagilina 1 mg');
    expect(text).toContain('P042');
  });

  it('escapa XML ao preencher o nome', () => {
    const filled = fillDiaryCopyXml('{{NOME}}', 1, {
      patientName: 'Ana & Cia <teste>',
      publicIdentifier: null,
      medications: { m1: null, m2: null, m3: null, m4: null, m5: null },
    });
    expect(filled).toBe('Ana &amp; Cia &lt;teste&gt;');
  });

  it('replica o modelo oficial em 7 vias quando o arquivo está no repositório', async () => {
    const original = join(
      process.cwd(),
      '../../diario_prime_free_living_formulario_revisado_final.docx',
    );
    if (!existsSync(original)) {
      return;
    }
    const { buffer } = await buildFreelivingDiaryDocument(
      {
        patientName: 'Paciente Oficial',
        publicIdentifier: 'P099',
        medications: {
          m1: 'Levodopa / Carbidopa 100 mg',
          m2: null,
          m3: null,
          m4: null,
          m5: null,
        },
      },
      readFileSync(original),
    );
    const zip = await JSZip.loadAsync(buffer);
    const xml = await zip.file('word/document.xml')!.async('string');
    expect(countPageBreaks(xml)).toBe(DIARY_DOCUMENT_COPIES - 1);
    expect((xml.match(/w:val="nextPage"/g) || []).length).toBe(
      DIARY_DOCUMENT_COPIES - 1,
    );
    expect(xml).toContain(`w:w="${A4_LANDSCAPE_WIDTH_TWIPS}"`);
    expect(xml).toContain('w:orient="landscape"');
    expect(extractWordText(xml)).toContain('Paciente Oficial');
    expect(extractWordText(xml)).toContain('Levodopa / Carbidopa 100 mg');
    expect(extractWordText(xml)).toContain('P099');
    expect(extractWordText(xml)).toMatch(/Data: \d{2}\/\d{2}\/\d{4}/);
    expect(extractWordText(xml)).toContain('Dia: 1/7');
    expect(extractWordText(xml)).not.toMatch(/PRIME\s+M1/);
    expect(xml).not.toContain('<w:t>PRIME</w:t>');
    expect(xml).toContain('r:embed="rIdLogoPrime"');
    expect(zip.file('word/media/logoprimeCompleto.png')).toBeTruthy();
    expect(extractWordText(xml)).not.toContain(
      'Diário do Participante Paciente Oficial',
    );
    expect(xml).not.toContain('tblpPr');
    expect(xml).not.toContain('w:w="-3501"');
    expect(xml).toContain('w:right="567"');
    expect(xml).toContain('w:left="567"');
    expect(xml).toContain('w:bottom="80"');
    expect(xml).toContain('<w:keepNext/>');
    expect(xml).not.toContain('w:type="fixed"');
    const section2Start = xml.lastIndexOf(
      '<w:p',
      xml.indexOf('xml:space="preserve">2. </w:t>'),
    );
    const section3Start = xml.lastIndexOf('<w:p', xml.indexOf('>3. Sintomas'));
    const section2 = xml.slice(section2Start, section3Start);
    expect(section2Start).toBeGreaterThan(0);
    expect(section3Start).toBeGreaterThan(section2Start);
    expect(section2).not.toContain('w:sz w:val="18"');
    expect(section2).not.toContain('w:sz w:val="24"');
    expect(section2).toContain('w:sz w:val="20"');
  });

  it('monta nome de arquivo estável', () => {
    expect(diaryDocumentFileName('José Ávila', 'P01')).toBe(
      'diario_free_living_P01_Jose_Avila_7dias.docx',
    );
  });
});
