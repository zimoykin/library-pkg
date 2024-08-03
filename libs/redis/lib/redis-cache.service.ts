import { Inject, Injectable, Logger } from "@nestjs/common";
import { Redis } from "ioredis";

@Injectable()
export class RedisCacheService {
    private readonly logger = new Logger(RedisCacheService.name);

    constructor(
        @Inject('REDIS_CONNECTION_CACHE') private readonly redis: Redis
    ) { }

    async setValue(key: string, value: string, opts?: { expire?: number; }) {
        await this.redis.set(key, value);
        if (opts?.expire) {
            await this.redis.expire(key, opts.expire);
        }
    }

    async getValueByKey(key: string) {
        return this.redis.get(key);
    }

}