import { Inject } from "@nestjs/common";
import { getRedisCacheToken, getRedisPubToken, getRedisSubToken } from "../get-topic-token";

/**
 * A decorator that injects the Redis subscription token for the specified topic name.
 *
 * @param topicName - The name of the Redis subscription topic.
 * @returns A decorator function that can be applied to a class property or method parameter.
 */
export const InjectSubRedisTopic = (topicName: string) => Inject(getRedisSubToken(topicName));
/**
 * A decorator that injects the Redis publish token for the specified topic name.
 *
 * @param topicName - The name of the Redis publish topic.
 * @returns A decorator function that can be applied to a class property or method parameter.
 */
export const InjectPubRedisTopic = (topicName: string) => Inject(getRedisPubToken(topicName));
/**
 * A decorator that injects the Redis cache token.
 *
 * @returns A decorator function that can be applied to a class property or method parameter.
 */
export const InjectCacheRedis = () => Inject(getRedisCacheToken());
