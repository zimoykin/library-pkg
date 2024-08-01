import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Redis } from 'ioredis';

@Injectable()
export class RedisPubService {
    private readonly logger: Logger = new Logger(RedisPubService.name);

    constructor(
        @Inject('REDIS_CONNECTION_PUB') private readonly redis: Redis,
        @Inject('REDIS_TOPIC') private readonly topic: string
    ) { }

    async publish(message: string) {
        return this.redis.publish(this.topic, message);
    }
}