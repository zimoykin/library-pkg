import { Inject, Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { Consumer } from 'kafkajs';
import { KafkaCloudModule } from './kafka.module';
import { Observable } from 'rxjs';

@Injectable()
export class KafkaCloudConsumer implements OnModuleInit {
    private readonly logger = new Logger(KafkaCloudConsumer.name);
    instance?: Consumer;
    constructor(
        @Inject('topic') private readonly topicName: string,
        @Optional() @Inject('groupId') private readonly groupId: string
    ) { }
    async onModuleInit() {
        let group = `kafka-cloud:${this.topicName}`;
        if (this.groupId) {
            group += `_${this.groupId}`;
        }
        this.instance = KafkaCloudModule.kafka.consumer({
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
                },
                autoCommit: true
            });
        });

        return observer.subscribe(cb);

    };
}
