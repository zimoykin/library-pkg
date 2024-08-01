import { DynamicModule, Logger, Module, Provider } from '@nestjs/common';
import { Redis } from 'ioredis';
import { IRedisAsyncOptions } from './interfaces/redis-options-async.interface';
import { getRedisPubToken, getRedisSubToken } from './helpers/get-topic-token';
import { RedisSubService } from './redis-sub.service';
import { RedisPubService } from './redis-pub.service';

@Module({})
export class RedisModule {
  private static readonly logger = new Logger(RedisModule.name);
  private static pub: Redis;
  private static sub: Redis;

  private static makeRedis(opt?: { host?: string, port?: number, password?: string; }) {
    const connectionProperties = {};
    if (opt?.host) {
      connectionProperties['host'] = opt.host;
    }
    if (opt?.port) {
      connectionProperties['port'] = opt.port;
    }
    if (opt?.password) {
      connectionProperties['password'] = opt.password;
    }
    const redis = new Redis(connectionProperties);
    return redis;
  }

  private static connection = async (redis: Redis) => {
    if (redis.status !== 'ready' && redis.status !== 'connecting' && redis.status !== 'connect') {
      redis.connect();
      redis.on('error', (error) => {
        RedisModule.logger.error(error);
      });
    }
    return redis;
  };

  static forRoot(host: string, port: number, username: string, password: string): DynamicModule {
    if (!RedisModule.pub) {
      const redis = this.makeRedis({ host, port, password });
      RedisModule.pub = redis;
    }
    if (!RedisModule.sub) {
      const redis = this.makeRedis({ host, port, password });
      RedisModule.sub = redis;
    }
    const providers: Provider[] = [
      {
        provide: 'REDIS_CONNECTION_SUB',
        useFactory: async (): Promise<Redis> => {
          return this.connection(RedisModule.sub);
        },
      },
      {
        provide: 'REDIS_CONNECTION_PUB',
        useFactory: async (): Promise<Redis> => {
          return this.connection(RedisModule.pub);
        },
      },
    ];

    return {
      module: RedisModule,
      providers: providers,
      exports: providers,
      global: true
    };
  }

  static forRootAsync(opts: IRedisAsyncOptions): DynamicModule {
    return {
      module: RedisModule,
      global: true,
      imports: opts.imports ?? [],
      providers: [
        {
          provide: 'REDIS_CONNECTION_SUB',
          useFactory: async (...args) => {
            const config = opts.useFactory(...args);
            if (!RedisModule.sub) {
              const redis = this.makeRedis({ host: config.host, port: config.port, password: config.password });
              RedisModule.sub = await this.connection(redis);
            }
            return RedisModule.sub;
          },
          inject: opts.inject,
        },
        {
          provide: 'REDIS_CONNECTION_PUB',
          useFactory: async (...args) => {
            const config = opts.useFactory(...args);
            if (!RedisModule.sub) {
              const redis = this.makeRedis({ host: config.host, port: config.port, password: config.password });
              RedisModule.pub = await this.connection(redis);
            }
            return RedisModule.pub;
          },
          inject: opts.inject,
        },
      ],
      exports: ['REDIS_CONNECTION_PUB', 'REDIS_CONNECTION_SUB'],
    };
  }

  static forFeature(topicName: string): DynamicModule {
    const providers: Provider[] = [
      {
        provide: 'REDIS_TOPIC',
        useValue: topicName
      },
      {
        provide: getRedisSubToken(topicName),
        useClass: RedisSubService
      },
      {
        provide: getRedisPubToken(topicName),
        useClass: RedisPubService
      }
    ];
    return {
      module: RedisModule,
      providers: providers,
      exports: providers,
    };
  }
}
