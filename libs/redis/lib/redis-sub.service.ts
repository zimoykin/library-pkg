import { Inject, Injectable, Logger } from "@nestjs/common";
import { Redis } from 'ioredis';
import { Observable } from "rxjs";

@Injectable()
export class RedisSubService {
    private readonly logger: Logger = new Logger(RedisSubService.name);

    constructor(
        @Inject('REDIS_CONNECTION_SUB') private readonly redis: Redis,
        @Inject('REDIS_TOPIC') private readonly topic: string
    ) { }

    /**
     * Subscribes to a Redis topic and returns an Observable that emits messages received on that topic.
     *
     * @param cb - A callback function that will be called for each message received on the subscribed topic.
     * @returns An Observable that emits the messages received on the subscribed topic.
     */
    async subscribe<T>(cb: (data: T) => void) {
        await this.redis.subscribe(this.topic);
        const observable = new Observable<T>((subscriber) => {
            this.redis.on('message', (channel, message) => {
                this.logger.debug(`Received message ${message} on channel ${channel}`);
                subscriber.next(message as T);
            });
        });

        return observable.subscribe(cb);
    }
}