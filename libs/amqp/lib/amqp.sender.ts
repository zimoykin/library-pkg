import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqplib from 'amqplib';

@Injectable()
export class AmqpSender implements OnModuleDestroy {
    private readonly logger = new Logger(AmqpSender.name);
    private channel: amqplib.Channel;

    constructor(
        // @ts-ignore
        @Inject('AMQP_CONNECTION') private readonly connection: amqplib.Connection,
        // @ts-ignore
        @Inject('AMQP_PATTERN') private readonly pattern: string
    ) { }

    /**
     * Initialize the AMQP channel for this sender.
     * 
     * This method ensures that the channel is initialized and the queue is declared.
     * If the channel is already initialized, this method does nothing.
     * 
     * @returns A promise that resolves when the channel is initialized.
     */
    
    async initChannel() {
        if (this.channel) {
            return;
        }
        this.logger.debug(`Initialize AMQP-Sender to ${this.pattern}`);
        const channel = await this.connection.createConfirmChannel();
        channel.prefetch(1);
        channel.assertQueue(this.pattern, {
            durable: true,
        });
        this.channel = channel; 
    }

    async onModuleDestroy() {
        this.logger.debug(`Destroy AMQP-Sender to ${this.pattern}`);
        this.channel?.close();
    }


    /**
     * Sends a message to the specified queue.
     * 
     * This method will first initialize the channel if it is not already initialized.
     * Then it will send the message to the queue and log any errors.
     * 
     * @param message - The message to send.
     */
    async sendMessage(message: Record<string, any>) {
        this.initChannel();
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
