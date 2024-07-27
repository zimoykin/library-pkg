import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Producer } from 'kafkajs';
import { KafkaModule } from './kafka.module';

@Injectable()
export class KafkaProducer implements OnModuleDestroy, OnModuleInit {
    private readonly logger = new Logger(KafkaProducer.name);
    instance? : Producer;
    constructor(
        @Inject('topic') private readonly topicName: string,
    ) { }
    onModuleInit() {
        this.instance = KafkaModule.kafka.producer({ allowAutoTopicCreation: true });
        this.instance.connect();
    }
    onModuleDestroy() {
        this.instance?.disconnect();
    }

    async send(message: any) {
        const value = JSON.stringify(message);
        return this.instance?.send({
            topic: this.topicName,
            messages: [{
                value: value,
                timestamp: new Date().getTime().toString()
            }]
        })
            .catch(error => this.logger.debug(error))
            .then(() => this.logger.debug(`Message sent: ${value}`));
    }
}
