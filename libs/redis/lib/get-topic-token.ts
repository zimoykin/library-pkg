function getRedisToken(topicName: string) {
    return `redis:${topicName}`;
}

export function getRedisSubToken(topicName: string) {
    return `sub:${getRedisToken(topicName)}`;
}
export function getRedisPubToken(topicName: string) {
    return `pub:${getRedisToken(topicName)}`;
}