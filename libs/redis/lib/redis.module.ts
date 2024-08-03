import { DynamicModule, Logger, Module, Provider } from '@nestjs/common';
import { Redis } from 'ioredis';
import { IRedisAsyncOptions } from './interfaces/redis-options-async.interface';
import { RedisSubService } from './redis-sub.service';
import { RedisPubService } from './redis-pub.service';
import { getRedisCacheToken, getRedisPubToken, getRedisSubToken } from './get-topic-token';
import { RedisCacheService } from './redis-cache.service';

@Module({})
export class RedisModule {
  private static readonly logger = new Logger(RedisModule.name);
  private static pub: Redis;
  private static sub: Redis;
  private static cache: Redis;

  /**
   * Creates a new Redis client instance with the provided connection options.
   *
   * @param opt - An optional object containing the connection options for the Redis client.
   * @param opt.host - The host address of the Redis server.
   * @param opt.port - The port number of the Redis server.
   * @param opt.password - The password for the Redis server.
   * @returns A new Redis client instance with the specified connection options.
   */
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

  /**
   * Configures the Redis module with the provided connection details and returns a dynamic module.
   * This method is used to set up the Redis connection for the entire application.
   *
   * @param host The host address of the Redis server.
   * @param port The port number of the Redis server.
   * @param username The username for the Redis server (optional).
   * @param password The password for the Redis server (optional).
   * @returns A dynamic module that can be imported into the application.
   */
  static forRoot(host: string, port: number, username: string, password: string): DynamicModule {
    if (!RedisModule.pub) {
      const redis = this.makeRedis({ host, port, password });
      RedisModule.pub = redis;
    }
    if (!RedisModule.sub) {
      const redis = this.makeRedis({ host, port, password });
      RedisModule.sub = redis;
    }
    if (!RedisModule.cache) {
      const redis = this.makeRedis({ host, port, password });
      RedisModule.cache = redis;
    }
    const providers: Provider[] = [
      {
        provide: 'REDIS_CONNECTION_CACHE',
        useFactory: async (): Promise<Redis> => {
          return this.connection(RedisModule.cache);
        },
      },
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

  /**
   * This method is used to set up the Redis connection for the entire application asynchronously.
   *
   * @param opts The options for the asynchronous Redis connection setup, including the configuration factory and any required dependencies.
   * @returns A dynamic module that can be imported into the application, which provides the Redis connections for cache, subscription, and publication.
   */
  static forRootAsync(opts: IRedisAsyncOptions): DynamicModule {
    return {
      module: RedisModule,
      global: true,
      imports: opts.imports ?? [],
      providers: [
        {
          provide: 'REDIS_CONNECTION_CACHE',
          useFactory: async (...args) => {
            const config = opts.useFactory(...args);
            if (!RedisModule.cache) {
              const redis = this.makeRedis({ host: config.host, port: config.port, password: config.password });
              RedisModule.cache = await this.connection(redis);
            }
            return RedisModule.cache;
          },
          inject: opts.inject,
        },
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
      exports: ['REDIS_CONNECTION_PUB', 'REDIS_CONNECTION_SUB', 'REDIS_CONNECTION_CACHE'],
    };
  }

  /**
   * Provides a dynamic module that can be imported into the application, which provides Redis topic-specific services for subscription and publication.
   *
   * @param topicName The name of the Redis topic to configure the subscription and publication services for.
   * @returns A dynamic module that can be imported into the application, which provides the Redis topic-specific services.
   */
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

  /**
   * Provides a dynamic module that can be imported into the application, which provides a Redis cache service.
   *
   * @returns A dynamic module that can be imported into the application, which provides the Redis cache service.
   */
  static Cache(): DynamicModule {
    const providers: Provider[] = [
      {
        provide: getRedisCacheToken(),
        useClass: RedisCacheService
      }
    ];
    return {
      module: RedisModule,
      providers: providers,
      exports: providers,
    };
  }
}
