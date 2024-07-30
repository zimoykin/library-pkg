import { Inject, Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { Consumer, Kafka } from 'kafkajs';
import { Observable } from 'rxjs';
import { KafkaModule } from './kafka.module';

@Injectable()
export class KafkaConsumer implements OnModuleInit {
    private readonly logger = new Logger(KafkaConsumer.name);
    instance?: Consumer;
    constructor(
        @Inject('topic') private readonly topicName: string,
        @Inject('KAFKA_CONNECTION') private readonly kafka: Kafka,
        @Optional() @Inject('groupId') private readonly groupId: string
    ) { }
    async onModuleInit() {
        let group = `kafka-:${this.topicName}`;
        if (this.groupId) {
            group += `_${this.groupId}`;
        }
        this.instance = this.kafka.consumer({
            groupId: group,
            heartbeatInterval: 5000,
            allowAutoTopicCreation: true,
            maxBytesPerPartition: 100 * 1024 * 1024,
            retry: {
                retries: 100,
                factor: 1,
                restartOnFailure: async (error) => {
                    this.logger.error(error);
                    return true;
                },
            }
        });
        await this.instance.connect();
        await this.instance.subscribe({ topic: this.topicName, fromBeginning: true });
    }

    listen<T = any>(cb: (data: T) => void) {
        const observer = new Observable<T>((subscriber) => {
            this.instance?.run({
                eachMessage: async ({ topic, message, partition }) => {
                    subscriber.next(message.value as T);
                    return {
                        then(onfulfilled, onrejected) {
                            if (onfulfilled) {
                                onfulfilled();
                                // TODO: investigate why 
                                KafkaModule.clearTopics(topic, message.offset.toString(), partition);
                            }
                        },
                    };
                },
                autoCommit: true
            });
        });

        return observer.subscribe(cb);

    };
}
