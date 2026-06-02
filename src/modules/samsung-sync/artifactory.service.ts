import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

type RemoteFileInfo = { sha256?: string | null };
type ArtifactListItem = {
  uri: string;
  size?: number | string;
  lastModified?: string;
  folder?: boolean;
};
type RequestOptions = {
  timeoutMs?: number;
  retries?: number;
};

@Injectable()
export class ArtifactoryService {
  private readonly logger = new Logger(ArtifactoryService.name);
  private readonly baseUrl: string;
  private readonly user: string;
  private readonly token: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = (this.configService.get<string>('ARTIFACTORY_URL') || '').replace(/\/$/, '');
    this.user = this.configService.get<string>('ARTIFACTORY_USER') || '';
    this.token = this.configService.get<string>('ARTIFACTORY_TOKEN') || '';
  }

  private get authHeaders(): Record<string, string> {
    const basicAuth = Buffer.from(`${this.user}:${this.token}`).toString('base64');
    return {
      Authorization: `Basic ${basicAuth}`,
    };
  }

  private ensureReady() {
    if (!this.baseUrl || !this.user || !this.token) {
      throw new Error(
        'Configuração do Artifactory incompleta. Verifique ARTIFACTORY_URL, ARTIFACTORY_USER e ARTIFACTORY_TOKEN.',
      );
    }
  }

  private buildStorageUrl(repo: string, artifactPath: string): string {
    const encodedPath = artifactPath
      .split('/')
      .filter(Boolean)
      .map((part) => encodeURIComponent(part))
      .join('/');
    return `${this.baseUrl}/api/storage/${repo}/${encodedPath}`;
  }

  getPublicBaseUrl(): string {
    return this.baseUrl;
  }

  getArtifactDownloadUrl(repo: string, artifactPath: string): string {
    return this.buildArtifactUrl(repo, artifactPath);
  }

  private buildArtifactUrl(repo: string, artifactPath: string): string {
    const encodedPath = artifactPath
      .split('/')
      .filter(Boolean)
      .map((part) => encodeURIComponent(part))
      .join('/');
    return `${this.baseUrl}/${repo}/${encodedPath}`;
  }

  private async requestWithRetry(
    url: string,
    init: RequestInit,
    options: RequestOptions = {},
  ): Promise<Response> {
    const retries = options.retries ?? 2;
    const timeoutMs = options.timeoutMs ?? 30000;
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, {
          ...init,
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (response.status >= 500 && attempt < retries) {
          this.logger.warn(
            `Artifactory ${init.method || 'GET'} ${url} retornou ${response.status}; tentativa ${attempt + 1}/${retries + 1}`,
          );
          continue;
        }
        return response;
      } catch (error) {
        clearTimeout(timer);
        lastError = error;
        if (attempt < retries) {
          this.logger.warn(
            `Falha de rede em ${init.method || 'GET'} ${url}; tentativa ${attempt + 1}/${retries + 1}`,
          );
          continue;
        }
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error('Erro desconhecido na comunicação com Artifactory');
  }

  getSha256(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  async ping(): Promise<boolean> {
    this.ensureReady();
    const response = await this.requestWithRetry(
      `${this.baseUrl}/api/system/ping`,
      {
        method: 'GET',
        headers: this.authHeaders,
      },
      { timeoutMs: 15000, retries: 1 },
    );
    return response.ok;
  }

  async getFileInfo(repo: string, artifactPath: string): Promise<RemoteFileInfo | null> {
    this.ensureReady();
    const response = await this.requestWithRetry(
      this.buildStorageUrl(repo, artifactPath),
      {
        method: 'GET',
        headers: this.authHeaders,
      },
      { timeoutMs: 20000, retries: 1 },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Falha ao consultar artefato ${repo}/${artifactPath}: HTTP ${response.status}`);
    }

    const data = (await response.json()) as { checksums?: { sha256?: string } };
    return { sha256: data.checksums?.sha256 || null };
  }

  async uploadFile(
    repo: string,
    artifactPath: string,
    buffer: Buffer,
    mimeType = 'application/octet-stream',
  ): Promise<string> {
    this.ensureReady();
    const sha256 = this.getSha256(buffer);
    const sha1 = createHash('sha1').update(buffer).digest('hex');
    const md5 = createHash('md5').update(buffer).digest('hex');

    const response = await this.requestWithRetry(
      this.buildArtifactUrl(repo, artifactPath),
      {
        method: 'PUT',
        headers: {
          ...this.authHeaders,
          'Content-Type': mimeType,
          'X-Checksum-Deploy': 'false',
          'X-Checksum-Sha256': sha256,
          'X-Checksum-Sha1': sha1,
          'X-Checksum-Md5': md5,
        },
        body: new Uint8Array(buffer),
      },
      { timeoutMs: 180000, retries: 2 },
    );

    if (!response.ok) {
      throw new Error(`Falha no upload ${repo}/${artifactPath}: HTTP ${response.status}`);
    }

    this.logger.log(`Upload concluído: ${repo}/${artifactPath}`);
    return sha256;
  }

  async uploadIfChanged(
    repo: string,
    artifactPath: string,
    buffer: Buffer,
    knownHash?: string | null,
    mimeType = 'application/octet-stream',
  ): Promise<{ uploaded: boolean; sha256: string }> {
    const sha256 = this.getSha256(buffer);

    if (knownHash && knownHash === sha256) {
      return { uploaded: false, sha256 };
    }

    const remote = await this.getFileInfo(repo, artifactPath);
    if (remote?.sha256 && remote.sha256 === sha256) {
      return { uploaded: false, sha256 };
    }

    await this.uploadFile(repo, artifactPath, buffer, mimeType);
    return { uploaded: true, sha256 };
  }

  async deleteFile(repo: string, artifactPath: string): Promise<void> {
    this.ensureReady();
    const response = await this.requestWithRetry(
      this.buildArtifactUrl(repo, artifactPath),
      {
        method: 'DELETE',
        headers: this.authHeaders,
      },
      { timeoutMs: 30000, retries: 2 },
    );

    if (response.status === 404) return;
    if (!response.ok) {
      throw new Error(`Falha ao remover ${repo}/${artifactPath}: HTTP ${response.status}`);
    }
  }

  async listStorage(
    repo: string,
    folderPath: string,
  ): Promise<
    {
      name: string;
      path: string;
      folder: boolean;
      size: number;
      last_modified: string | null;
    }[]
  > {
    this.ensureReady();
    const cleaned = folderPath.replace(/^\/+|\/+$/g, '');
    const url = cleaned
      ? `${this.baseUrl}/api/storage/${repo}/${cleaned}?list&deep=0&listFolders=1`
      : `${this.baseUrl}/api/storage/${repo}?list&deep=0&listFolders=1`;
    const response = await this.requestWithRetry(
      url,
      {
        method: 'GET',
        headers: this.authHeaders,
      },
      { timeoutMs: 30000, retries: 2 },
    );

    if (!response.ok) {
      if (response.status === 404) return [];
      throw new Error(`Falha ao listar storage ${repo}/${cleaned || '/'}: HTTP ${response.status}`);
    }

    const payload = (await response.json()) as { files?: ArtifactListItem[] };
    const files = Array.isArray(payload.files) ? payload.files : [];
    return files
      .map((item) => {
        const rawName = item.uri?.replace(/^\//, '') || '';
        const isFolder = Boolean(item.folder) || rawName.endsWith('/');
        const name = rawName.replace(/\/$/, '');
        const path = cleaned ? `${cleaned}/${name}` : name;
        return {
          name,
          path,
          folder: isFolder,
          size: Number(item.size || 0),
          last_modified: item.lastModified || null,
        };
      })
      .filter((item) => item.name.length > 0)
      .sort((a, b) => {
        if (a.folder !== b.folder) return a.folder ? -1 : 1;
        return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
      });
  }

  async listArtifacts(repo: string, basePath: string): Promise<
    {
      name: string;
      path: string;
      size: number;
      last_modified: string | null;
      download_url: string;
    }[]
  > {
    this.ensureReady();
    const cleaned = basePath.replace(/^\/+|\/+$/g, '');
    const url = `${this.baseUrl}/api/storage/${repo}/${cleaned}?list&deep=0&listFolders=0`;
    const response = await this.requestWithRetry(
      url,
      {
        method: 'GET',
        headers: this.authHeaders,
      },
      { timeoutMs: 30000, retries: 2 },
    );

    if (!response.ok) {
      if (response.status === 404) return [];
      throw new Error(`Falha ao listar artefatos ${repo}/${cleaned}: HTTP ${response.status}`);
    }

    const payload = (await response.json()) as { files?: ArtifactListItem[] };
    const files = Array.isArray(payload.files) ? payload.files : [];
    return files
      .filter((item) => !item.folder)
      .map((item) => {
        const rawName = item.uri?.replace(/^\//, '') || '';
        const path = `${cleaned}/${rawName}`;
        return {
          name: rawName,
          path,
          size: Number(item.size || 0),
          last_modified: item.lastModified || null,
          download_url: this.buildArtifactUrl(repo, path),
        };
      });
  }

  async downloadFile(repo: string, artifactPath: string): Promise<{
    buffer: Buffer;
    contentType: string;
  }> {
    this.ensureReady();
    const response = await this.requestWithRetry(
      this.buildArtifactUrl(repo, artifactPath),
      {
        method: 'GET',
        headers: this.authHeaders,
      },
      { timeoutMs: 120000, retries: 1 },
    );
    if (!response.ok) {
      throw new Error(`Falha ao baixar ${repo}/${artifactPath}: HTTP ${response.status}`);
    }
    const ab = await response.arrayBuffer();
    return {
      buffer: Buffer.from(ab),
      contentType: response.headers.get('content-type') || 'application/octet-stream',
    };
  }
}
