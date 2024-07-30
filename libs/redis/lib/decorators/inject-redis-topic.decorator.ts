import { Inject } from "@nestjs/common";
import { getRedisPubToken, getRedisSubToken } from "../get-topic-token";

export const InjectSubRedisTopic = (topicName: string) => Inject(getRedisSubToken(topicName));

export function InjectPubRedisTopic(topicName: string) {
    return Inject(getRedisPubToken(topicName));
} 