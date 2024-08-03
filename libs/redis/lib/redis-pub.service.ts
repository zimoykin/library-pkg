import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Redis } from 'ioredis';

@Injectable()
export class RedisPubService {
    private readonly logger: Logger = new Logger(RedisPubService.name);

    constructor(
        @Inject('REDIS_CONNECTION_PUB') private readonly redis: Redis,
        @Inject('REDIS_TOPIC') private readonly topic: string
    ) { }

    /**
     * Publishes the provided data to the configured Redis topic.
     *
     * @param data - The data to publish, which can be a string or an object that will be serialized to JSON.
     * @returns A promise that resolves when the data has been published.
     */
    async publish(data: string | Record<string, any>) {
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        return this.redis.publish(this.topic, message);
    }
}