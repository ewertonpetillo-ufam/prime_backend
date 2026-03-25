import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import * as http from 'node:http';
import * as https from 'node:https';
import { Readable } from 'stream';

/** HTTP(S) com timeouts relaxados e keep-alive — reduz ECONNRESET em túnel SSH / rede lenta. */
function createS3NodeHttpHandler(): NodeHttpHandler {
  return new NodeHttpHandler({
    connectionTimeout: 60_000,
    requestTimeout: 0,
    socketTimeout: 0,
    httpAgent: new http.Agent({ keepAlive: true, keepAliveMsecs: 30_000 }),
    httpsAgent: new https.Agent({ keepAlive: true, keepAliveMsecs: 30_000 }),
  });
}

@Injectable()
export class MinioStorageService {
  private readonly bucket: string;
  private readonly internalClient: S3Client;
  private readonly presignClient: S3Client;
  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    const endpoint = config.get<string>('MINIO_ENDPOINT')?.trim();
    const publicBase =
      config.get<string>('MINIO_PUBLIC_BASE_URL')?.trim() || endpoint || '';
    const accessKey = config.get<string>('MINIO_ACCESS_KEY')?.trim();
    const secretKey = config.get<string>('MINIO_SECRET_KEY')?.trim();
    this.bucket = config.get<string>('MINIO_BUCKET')?.trim() || 'prime-coleta';
    const region = config.get<string>('MINIO_REGION')?.trim() || 'us-east-1';
    const forcePathStyle = config.get<string>('MINIO_FORCE_PATH_STYLE') !== 'false';

    this.enabled = !!(endpoint && accessKey && secretKey);

    if (this.enabled) {
      const requestHandler = createS3NodeHttpHandler();
      this.internalClient = new S3Client({
        region,
        endpoint,
        credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
        forcePathStyle,
        requestHandler,
      });
      this.presignClient = new S3Client({
        region,
        endpoint: publicBase || endpoint,
        credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
        forcePathStyle,
        requestHandler: createS3NodeHttpHandler(),
      });
    } else {
      this.internalClient = null as unknown as S3Client;
      this.presignClient = null as unknown as S3Client;
    }
  }

  getBucket(): string {
    return this.bucket;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  assertEnabled(): void {
    if (!this.enabled) {
      throw new Error('MinIO storage is not configured');
    }
  }

  async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
    this.assertEnabled();
    await this.internalClient.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  async deleteObject(key: string): Promise<void> {
    this.assertEnabled();
    await this.internalClient.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  async getObjectBuffer(key: string): Promise<Buffer> {
    this.assertEnabled();
    const out = await this.internalClient.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    const stream = out.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  async getPresignedGetUrl(key: string, expiresInSeconds: number): Promise<string> {
    this.assertEnabled();
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.presignClient, command, { expiresIn: expiresInSeconds });
  }
}
