import { Inject } from "@nestjs/common";
import { getRedisCacheToken, getRedisPubToken, getRedisSubToken } from "../get-topic-token";

export const InjectSubRedisTopic = (topicName: string) => Inject(getRedisSubToken(topicName));
export const InjectPubRedisTopic = (topicName: string) => Inject(getRedisPubToken(topicName));
export const InjectCacheRedis = () => Inject(getRedisCacheToken());
