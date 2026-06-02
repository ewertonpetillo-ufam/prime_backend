import {
  buildArchiveEntryDownloadUrl,
  buildSubjectDataZipPath,
  SUBJECT_DATA_FOLDER,
  buildDataZipArtifactPath,
  buildDeliveryMetadataCsv,
  buildDeliveryZipFileName,
  buildDeviceSubZipPath,
  buildMetadataCsvArtifactPath,
  createZipBufferFromEntries,
  formatCollectionDateForMetadata,
  getDeliveryDateFolder,
} from './samsung-dataset.utils';

describe('samsung-dataset.utils', () => {
  it('getDeliveryDateFolder uses YYYYMMDD', () => {
    const folder = getDeliveryDateFolder(new Date('2025-05-19T15:00:00Z'));
    expect(folder).toMatch(/^\d{8}$/);
  });

  it('formatCollectionDateForMetadata returns YYYY-MM-DD from dataColeta', () => {
    expect(
      formatCollectionDateForMetadata({
        data: { dataColeta: '2026-03-12' },
      }),
    ).toBe('2026-03-12');
  });

  it('builds artifact paths under ARTIFACTORY_BASE_PATH only', () => {
    expect(buildDataZipArtifactPath('test_api', '20250602')).toBe(
      'test_api/Data/20250602.zip',
    );
    expect(buildMetadataCsvArtifactPath('test_api', '20250602')).toBe(
      'test_api/Metadata/20250602_metadata.csv',
    );
    expect(buildDeliveryZipFileName('20250602')).toBe('20250602.zip');
  });

  it('buildArchiveEntryDownloadUrl uses Artifactory zip entry syntax', () => {
    const url = buildArchiveEntryDownloadUrl(
      'https://bart.example.com/artifactory',
      'srbr-ufamprime-generic-local',
      'test_api',
      '20260602',
      '20260602/S001/1_In-Clinic/SP.zip',
    );
    expect(url).toBe(
      'https://bart.example.com/artifactory/srbr-ufamprime-generic-local/test_api/Data/20260602.zip!/20260602/S001/1_In-Clinic/SP.zip',
    );
  });

  it('buildSubjectDataZipPath uses delivery date and Subject_Data', () => {
    expect(buildSubjectDataZipPath('20250602', 'S001', '1_In-Clinic', 'file.csv')).toBe(
      `20250602/S001/1_In-Clinic/${SUBJECT_DATA_FOLDER}/file.csv`,
    );
  });

  it('buildDeviceSubZipPath names device zip', () => {
    expect(buildDeviceSubZipPath('20250602', 'S001', '1_In-Clinic', 'SP')).toBe(
      '20250602/S001/1_In-Clinic/SP.zip',
    );
  });

  it('buildDeliveryMetadataCsv outputs header and quoted rows', () => {
    const csv = buildDeliveryMetadataCsv([
      { generation_date: '2026-03-12', download_url: 'https://example.com/a' },
    ]);
    expect(csv).toContain('generation_date,download_url');
    expect(csv).toContain('"2026-03-12"');
    expect(csv).toContain('https://example.com/a');
  });

  it('createZipBufferFromEntries returns non-empty buffer', async () => {
    const buf = await createZipBufferFromEntries([
      { name: 'hello.txt', buffer: Buffer.from('hi') },
    ]);
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(10);
  }, 15000);
});
