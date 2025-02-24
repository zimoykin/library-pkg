import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class CloudflareStorageService {
  private readonly logger = new Logger(CloudflareStorageService.name);

  constructor(
    @Inject('CLOUDFLARE_BUCKET_NAME') private readonly bucketName: string,
    @Inject('CLOUDFLARE_FOLDER_NAME') private readonly folderName: string,
    @Inject('CLOUDFLARE_S3_CONNECTION') private readonly s3: S3Client,
    @Inject('CLOUDFLARE_ACCOUNT_ID') private readonly accountId: string,
  ) { }

  async upload(
    fileBuffer: Buffer,
    key: string,
  ): Promise<{ url: string; key: string; bucketName: string; folder: string }> {
    const fullKey = `${this.folderName}/${key}`;
    const params: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: fullKey,
      Body: fileBuffer,
    };

    const upload = new Upload({
      client: this.s3,
      params,
    });

    try {
      await upload.done();
      return {
        url: `https://${this.bucketName}.${this.accountId}.r2.cloudflarestorage.com/${fullKey}`,
        key,
        folder: this.folderName,
        bucketName: this.bucketName,
      };
    } catch (err) {
      this.logger.error('Upload failed:', err);
      throw new Error('Failed to upload file to Cloudflare R2');
    }
  }

  async generateSignedUrl(key: string): Promise<{ url: string; expiresIn: number }> {
    const fullKey = `${this.folderName}/${key}`;
    const expiresIn = 60 * 60 * 24 * 7; // 7 days

    try {
      const params = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fullKey,
      });

      const url = await getSignedUrl(this.s3, params, {
        expiresIn,
      });

      return { url, expiresIn: Date.now() + expiresIn * 1000 };
    } catch (err) {
      this.logger.error('Error generating signed URL:', err);
      throw new Error('Failed to generate signed URL for the requested file');
    }
  }

  async deleteFile(key: string): Promise<void> {
    const fullKey = `${this.folderName}/${key}`;

    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: fullKey,
        }),
      );
    } catch (err) {
      this.logger.error('Error deleting file:', err);
      throw new Error('Failed to delete file from Cloudflare R2');
    }
  }
}
