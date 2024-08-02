import { Module, DynamicModule, Provider, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Admin, Kafka } from 'kafkajs';
import { KafkaConsumer } from './kafka.consumer';
import { KafkaProducer } from './kafka.producer';
import { getTopicToken } from './helpers/get-model-token';
import { KafkaAsyncOptions } from './interfaces/options.interface';
import { KafkaAdminService } from './kafka-admin.service';

@Module({})
export class KafkaModule implements OnModuleDestroy, OnModuleInit {
  readonly logger = new Logger(KafkaModule.name);
  private static kafka: Kafka; //singletone
  private static admin: Admin;

  async onModuleDestroy() {
    if (KafkaModule.admin) {
      KafkaModule.admin.disconnect();
    }
  }

  async onModuleInit() {
    if (!KafkaModule.admin && KafkaModule.kafka) {
      KafkaModule.admin = KafkaModule.kafka.admin();
    }
  }

  static forRoot(clientId: string, brokers: string[]): DynamicModule {
    if (!KafkaModule.kafka) {
      KafkaModule.kafka = new Kafka({
        clientId: clientId,
        brokers: brokers
      });

      KafkaModule.kafka.admin({
        retry: {
          retries: 100,
          factor: 1,
          restartOnFailure: async (error) => {
            console.log(error);
            return true;
          },
        }
      });
    }

    const providers: Provider[] = [
      {
        provide: 'KAFKA_CONNECTION',
        useValue: KafkaModule.kafka
      },
      {
        provide: 'kafka:admin',
        useClass: KafkaAdminService
      }
    ];

    return {
      module: KafkaModule,
      providers: providers,
      exports: providers,
    };
  }

  static forRootAsync(opts: KafkaAsyncOptions): DynamicModule {
    return {
      module: KafkaModule,
      imports: opts.imports ?? [],
      global: true,
      providers: [
        {
          provide: 'KAFKA_CONNECTION',
          useFactory: async (...args) => {
            const config = await opts.useFactory(...args);
            //define kafka instance  if not exists
            KafkaModule.forRoot(config.clientId, config.brokers.split(','));
            return KafkaModule.kafka;
          },
          inject: opts.inject,
        },
        {
          provide: 'kafka:admin',
          useClass: KafkaAdminService
        }
      ],
      exports: ['KAFKA_CONNECTION'],
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
        useClass: KafkaConsumer,
      },
      {
        provide: getTopicToken(topicName, 'producer'),
        useClass: KafkaProducer,
      },
      {
        provide: 'KAFKA_CLEAR_TOPICS',
        useValue: this.clearTopics
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
      module: KafkaModule,
      providers,
      exports: providers,
      global: true,
    };
  }

  private static async clearTopics(topic: string, offset: string, partition: number): Promise<void> {
    if (KafkaModule.admin) {
      const admin = KafkaModule.admin;
      await admin.listTopics();
      await admin.deleteTopicRecords({
        topic: topic,
        partitions: [{
          offset: String(Number(offset) - 1),
          partition: partition
        }]
      });
    }
  }
}
