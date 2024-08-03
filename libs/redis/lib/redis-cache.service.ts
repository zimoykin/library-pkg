import { Inject, Injectable, Logger } from "@nestjs/common";
import { Redis } from "ioredis";

@Injectable()
export class RedisCacheService {
    private readonly logger = new Logger(RedisCacheService.name);

    constructor(
        @Inject('REDIS_CONNECTION_CACHE') private readonly redis: Redis
    ) { }

    /**
     * Sets a value in the Redis cache with the given key. Optionally, an expiration time can be provided.
     *
     * @param key - The key to use for the cached value.
     * @param value - The value to store in the cache.
     * @param opts - An optional object with an `expire` property to set the expiration time in seconds.
     */
    async setValue(key: string, value: string, opts?: { expire?: number; }) {
        await this.redis.set(key, value);
        if (opts?.expire) {
            await this.redis.expire(key, opts.expire);
        }
    }

    /**
     * Retrieves the value stored in the Redis cache for the given key.
     *
     * @param key - The key to use for retrieving the cached value.
     * @returns The value stored in the cache for the given key, or `null` if the key does not exist.
     */
    async getValueByKey(key: string) {
        return this.redis.get(key);
    }

}