import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducer implements OnModuleDestroy, OnModuleInit {
    private readonly logger = new Logger(KafkaProducer.name);
    private instance?: Producer;
    constructor(
        @Inject('topic') private readonly topicName: string,
        @Inject('KAFKA_CONNECTION') private readonly kafka: Kafka,
    ) { }
    onModuleInit() {
        this.instance = this.kafka.producer({ allowAutoTopicCreation: true });
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
