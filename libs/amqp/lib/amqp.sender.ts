import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqplib from 'amqplib';

@Injectable()
export class AmqpSender implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(AmqpSender.name);
    private channel: amqplib.Channel;

    constructor(
        // @ts-ignore
        @Inject('AMQP_CONNECTION') private readonly connection: amqplib.Connection,
        // @ts-ignore
        @Inject('AMQP_PATTERN') private readonly pattern: string
    ) { }

    async onModuleInit() {
        this.logger.debug(`Init Sender to ${this.pattern}`);
        const channel = await this.connection.createConfirmChannel();
        channel.prefetch(1);
        channel.assertQueue(this.pattern, {
            durable: true,
        });
        this.channel = channel; 
    }

    async onModuleDestroy() {
        this.logger.debug(`Destroy Sender to ${this.pattern}`);
        this.channel?.close();
    }


    async sendMessage(message: Record<string, any>) {
        try {
            this.channel?.sendToQueue(this.pattern, Buffer.from(JSON.stringify(message)), {
                persistent: true
            });
        }
        catch (err) {
            this.logger.error(err);
        }
    }
}
