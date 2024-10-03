import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as amqplib from 'amqplib';
import { Observable, Subscriber } from 'rxjs';

@Injectable()
export class AmqpConsumer implements OnModuleDestroy {
    private readonly logger = new Logger(AmqpConsumer.name);
    private channel: amqplib.Channel;

    constructor(
        // @ts-ignore
        @Inject('AMQP_CONNECTION') private readonly connection: amqplib.Connection,
        // @ts-ignore
        @Inject('AMQP_PATTERN') private readonly pattern: string
    ) { }

    async onModuleDestroy() {
        if (this.channel) {
            await this.channel.close();
            this.logger.debug('AMQP channel closed');
        }
    }

    /**
     * Subscribe to an AMQP queue and listen for messages.
     *
     * @param cb - The callback to call when a message is received. The callback receives the parsed message object as an argument.
     * @returns A promise that resolves to a function which unsubscribes from the queue and closes the channel when called.
     * @throws {Error} - If there is an error subscribing to the queue, the promise is rejected with the error.
     */
    async subscribe<T>(cb: (message: T) => void): Promise<() => Promise<void>> {
        try {
            this.channel = await this.connection.createChannel();
            await this.channel.assertQueue(this.pattern, { durable: true });
            this.channel.prefetch(1);
            this.logger.debug(`Initialized AMQP Consumer for pattern: ${this.pattern}`);

            const observable = new Observable((subscriber: Subscriber<T>) => {
                this.channel.consume(this.pattern, (message) => {
                    if (message !== null) {
                        const parsedMessage = JSON.parse(message.content.toString()) as T;
                        subscriber.next(parsedMessage);
                        this.channel.ack(message);
                    }
                });
            });

            const subscription = observable.subscribe(cb);

            return async () => {
                subscription.unsubscribe();
                await this.channel.close();
                this.logger.debug(`Stopped consuming from pattern: ${this.pattern}`);
            };
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to subscribe to AMQP queue: ${error.message}`);
            }
            throw error;
        }
    }
}
