import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Redis } from 'ioredis';

@Injectable()
export class RedisPubService implements OnModuleInit {
    private readonly logger: Logger = new Logger(RedisPubService.name);

    constructor(
        @Inject('REDIS_CONNECTION_PUB') private readonly redis: Redis,
        @Inject('REDIS_TOPIC') private readonly topic: string
    ) { }

    async onModuleInit() {
        this.logger.debug(`Redis client(pub) connected to ${this.topic}`);
    }

    publish(topic: string, message: string) {
        return this.redis.publish(topic, message);
    }
}