import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
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
  ): Promise<{ url: string; key: string; bucketName: string; folder: string; }> {
    const fullKey = `${this.folderName}/${key}`;
    const params: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: fullKey,
      Body: fileBuffer,
      CacheControl: 'no-store, public, max-age=0, must-revalidate',
    };

    const upload = new Upload({
      client: this.s3,
      params
    });

    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: fullKey,
        })
      );

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

  async generateSignedUrl(key: string): Promise<{ url: string; expiresIn: number; }> {
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

  async deleteFolder(folderName: string): Promise<void> {
    try {
      const listParams = {
        Bucket: this.bucketName,
        Prefix: `${folderName}/`,
      };

      let isTruncated = true;
      let continuationToken: string | undefined;

      while (isTruncated) {
        const command = new ListObjectsV2Command({
          ...listParams,
          ContinuationToken: continuationToken,
        });

        const response = await this.s3.send(command);

        if (!response.Contents || response.Contents.length === 0) {
          this.logger.log(`No objects found in folder: ${folderName}`);
          return;
        }

        const deleteParams = {
          Bucket: this.bucketName,
          Delete: {
            Objects: response.Contents.map(({ Key }) => ({ Key })),
          },
        };

        await this.s3.send(new DeleteObjectsCommand(deleteParams));

        isTruncated = response.IsTruncated ?? false;
        continuationToken = response.NextContinuationToken;
      }

      this.logger.log(`Folder '${folderName}' deleted successfully.`);
    } catch (err) {
      this.logger.error("Error deleting folder:", err);
      throw new Error("Failed to delete folder from S3");
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
