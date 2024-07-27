import { Module, DynamicModule, OnModuleInit, Provider, Logger } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { KafkaCloudConsumer } from './kafka.consumer';
import { KafkaCloudProducer } from './kafka.producer';
import { getTopicToken } from './helpers/get-model-token';


interface KafkaAsyncOptions {
  imports: any[],
  useFactory: (...args: any[]) => any;
  inject?: any[];
}

// @Global()
@Module({})
export class KafkaCloudModule implements OnModuleInit {
  readonly logger = new Logger(KafkaCloudModule.name);
  static kafka: Kafka;

  async onModuleInit() {
    // this.logger.debug(`Module initialized`);
    // KafkaCloudModule.kafka.logger().debug(`Kafka initialized`);
  }

  static forRoot(clientId: string, brokers: string[]): DynamicModule {
    if (!KafkaCloudModule.kafka) {
      KafkaCloudModule.kafka = new Kafka({
        clientId: clientId,
        brokers: brokers
      });

      KafkaCloudModule.kafka.admin({
        retry: {
          retries: 100,
          factor: 1,
          restartOnFailure: async (error) => {
            console.log(error);
            return true;
          },
        }
      });
      return {
        module: KafkaCloudModule
      };
    }
  }

  static forRootAsync(opts: KafkaCloudAsyncOptions): DynamicModule {
    return {
      module: KafkaCloudModule,
      imports: opts.imports,
      providers: [
        {
          provide: 'ASYNC_CONFIG',
          useFactory: async (...args) => {
            const config = await opts.useFactory(...args);
            KafkaCloudModule.forRoot(config.clientId, config.brokers.split(','));
            return config;
          },
          inject: opts.inject,
        },
      ],
      exports: ['ASYNC_CONFIG'],
    };
  }
  /**
   * Creates a dynamic module for a specific topic with optional group ID.
   *
   * @param {string} topicName - The name of the topic, ussually the name of the model.
   * @param {string} [groupId] - The group ID (optional) use to get messages in parallel.
   * @return {DynamicModule} The dynamic module.
   */
  static forFeature(topicName: string, groupId?: string): DynamicModule {
    const providers: Provider[] = [
      {
        provide: getTopicToken(topicName, 'consumer'),
        useClass: KafkaCloudConsumer,
      },
      {
        provide: getTopicToken(topicName, 'producer'),
        useClass: KafkaCloudProducer,
      },
      {
        provide: 'topic',
        useValue: topicName,
      }
    ];

    if (groupId) {
      providers.push({
        provide: 'groupId',
        useValue: groupId,
      },
        {
          provide: 'groupId',
          useValue: groupId,
        },);
    }

    return {
      module: KafkaCloudModule,
      providers,
      exports: providers,
      global: true,
    };
  }
}
