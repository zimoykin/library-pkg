import { DynamicModule, InjectionToken, Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { CloudflareStorageService } from './bucket.service';
import { getBucketToken } from './get-bucket-token.helper';

interface CloudflareStorageModuleOptions {
    accountId: string;
    endpoint: string; // Обязательно указывать Cloudflare R2 endpoint
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
}

interface CloudflareStorageModuleOptionsAsync {
    useFactory: (args: any) => CloudflareStorageModuleOptions | Promise<CloudflareStorageModuleOptions>;
    inject: InjectionToken[];
    imports?: any[];
}

@Module({})
export class CloudflareStorageModule {
    private static client: Promise<S3Client> | null = null;
    private static bucketName: string;
    private static accountId: string;

    private static async makeConnection(opts: CloudflareStorageModuleOptions): Promise<S3Client> {
        if (!this.client) {
            this.client = (async () => {
                try {
                    const s3 = new S3Client({
                        region: 'auto', // В R2 region
                        endpoint: opts.endpoint, //"https://<account-id>.r2.cloudflarestorage.com"
                        credentials: {
                            accessKeyId: opts.accessKeyId,
                            secretAccessKey: opts.secretAccessKey,
                        },
                    });

                    this.bucketName = opts.bucketName;
                    this.accountId = opts.accountId;

                    return s3;
                } catch (error) {
                    console.error('Error initializing Cloudflare R2 client:', error);
                    throw new Error('Failed to initialize Cloudflare R2 connection');
                }
            })();
        }
        return this.client;
    }

    static forRoot(opts: CloudflareStorageModuleOptions): DynamicModule {
        return {
            module: CloudflareStorageModule,
            providers: [
                {
                    provide: 'CLOUDFLARE_S3_CONNECTION',
                    useFactory: async () => await this.makeConnection(opts),
                },
                {
                    provide: 'CLOUDFLARE_BUCKET_NAME',
                    useValue: opts.bucketName,
                },
                {
                    provide: 'CLOUDFLARE_ACCOUNT_ID',
                    useValue: opts.accountId,
                },
            ],
            exports: ['CLOUDFLARE_S3_CONNECTION', 'CLOUDFLARE_BUCKET_NAME', 'CLOUDFLARE_ACCOUNT_ID'],
            global: true,
        };
    }

    static forRootAsync(opts: CloudflareStorageModuleOptionsAsync): DynamicModule {
        return {
            module: CloudflareStorageModule,
            providers: [
                {
                    provide: 'CLOUDFLARE_S3_CONNECTION',
                    useFactory: async (args: any) => {
                        const config = await opts.useFactory(args);
                        return await this.makeConnection(config);
                    },
                    inject: opts.inject,
                },
                {
                    provide: 'CLOUDFLARE_BUCKET_NAME',
                    useFactory: async (args: any) => {
                        const config = await opts.useFactory(args);
                        return config.bucketName;
                    },
                    inject: opts.inject,
                },
                {
                    provide: 'CLOUDFLARE_ACCOUNT_ID',
                    useFactory: async (args: any) => {
                        const config = await opts.useFactory(args);
                        return config.accountId;
                    },
                    inject: opts.inject,
                },
            ],
            exports: ['CLOUDFLARE_S3_CONNECTION', 'CLOUDFLARE_BUCKET_NAME', 'CLOUDFLARE_ACCOUNT_ID'],
            global: true,
        };
    }

    static forFeature(folderName: string): DynamicModule {
        return {
            module: CloudflareStorageModule,
            providers: [
                {
                    provide: 'CLOUDFLARE_FOLDER_NAME',
                    useValue: folderName,
                },
                {
                    provide: getBucketToken(folderName),
                    useClass: CloudflareStorageService,
                },
            ],
            exports: ['CLOUDFLARE_FOLDER_NAME', getBucketToken(folderName)],
        };
    }
}
