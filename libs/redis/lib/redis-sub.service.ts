import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Redis } from 'ioredis';

@Injectable()
export class RedisSubService implements OnModuleInit {
    private readonly logger: Logger = new Logger(RedisSubService.name);

    constructor(
        @Inject('REDIS_CONNECTION_SUB') private readonly redis: Redis,
        @Inject('REDIS_TOPIC') private readonly topic: string
    ) { }

    async onModuleInit() {
        this.logger.debug(`Redis client(sub) connected to ${this.topic}`);
        this.redis.subscribe(this.topic, (message) => {
            this.logger.debug(`Redis client subscribed to ${this.topic} - ${message}`);
        });
    }
    subscribeToMessages() {
        this.redis.subscribe(this.topic);
        this.redis.on('message', (channel, message) => {
            if (channel === this.topic) {
                console.log(`Received message from topic ${this.topic}: ${message}`);
            }
        });
    }
}