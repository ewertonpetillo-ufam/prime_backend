import { createHash } from 'crypto';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { mkdtemp, writeFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { AddressInfo } from 'net';
import { ConfigService } from '@nestjs/config';
import { ArtifactoryService } from './artifactory.service';

const listen = (server: ReturnType<typeof createServer>) =>
  new Promise<number>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve((server.address() as AddressInfo).port);
    });
  });

const closeServer = (server: ReturnType<typeof createServer>) =>
  new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

describe('ArtifactoryService.uploadFileFromPath', () => {
  it('streams the file in one pass and returns the SHA256', async () => {
    const payload = Buffer.alloc(256 * 1024, 7);
    const expectedSha = createHash('sha256').update(payload).digest('hex');
    let received = 0;

    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      if (req.method !== 'PUT') {
        res.statusCode = 404;
        res.end();
        return;
      }
      req.on('data', (chunk: Buffer) => {
        received += chunk.length;
      });
      req.on('end', () => {
        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ checksums: { sha256: expectedSha } }));
      });
    });

    const port = await listen(server);
    const dir = await mkdtemp(join(tmpdir(), 'artifactory-upload-'));
    const filePath = join(dir, 'delivery.zip');
    await writeFile(filePath, payload);

    try {
      const service = new ArtifactoryService({
        get: (key: string) => {
          const map: Record<string, string> = {
            ARTIFACTORY_URL: `http://127.0.0.1:${port}/artifactory`,
            ARTIFACTORY_USER: 'user',
            ARTIFACTORY_TOKEN: 'token',
          };
          return map[key];
        },
      } as unknown as ConfigService);

      const sha = await service.uploadFileFromPath(
        'repo',
        'test_api/Data/20260828.zip',
        filePath,
      );
      expect(sha).toBe(expectedSha);
      expect(received).toBe(payload.length);
    } finally {
      await closeServer(server);
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('reopens the file after a 500 and succeeds on retry', async () => {
    const payload = Buffer.from('retry-me');
    const expectedSha = createHash('sha256').update(payload).digest('hex');
    let attempts = 0;

    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      attempts += 1;
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        if (attempts === 1) {
          res.statusCode = 500;
          res.end('temporary');
          return;
        }
        res.statusCode = 201;
        res.end(JSON.stringify({ checksums: { sha256: expectedSha } }));
      });
    });

    const port = await listen(server);
    const dir = await mkdtemp(join(tmpdir(), 'artifactory-retry-'));
    const filePath = join(dir, 'delivery.zip');
    await writeFile(filePath, payload);

    try {
      const service = new ArtifactoryService({
        get: (key: string) => {
          const map: Record<string, string> = {
            ARTIFACTORY_URL: `http://127.0.0.1:${port}/artifactory`,
            ARTIFACTORY_USER: 'user',
            ARTIFACTORY_TOKEN: 'token',
          };
          return map[key];
        },
      } as unknown as ConfigService);

      const sha = await service.uploadFileFromPath('repo', 'a.zip', filePath);
      expect(sha).toBe(expectedSha);
      expect(attempts).toBe(2);
    } finally {
      await closeServer(server);
      await rm(dir, { recursive: true, force: true });
    }
  });
});
