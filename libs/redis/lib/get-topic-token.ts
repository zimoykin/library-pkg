/**
 * Returns a Redis token for the given topic name.
 * @param topicName - The name of the topic to get the Redis token for.
 * @returns {string} The Redis token for the given topic name.
 */
function getRedisToken(topicName: string) {
    return `redis:${topicName}`;
}
/**
 * Returns a Redis subscribe token for the given topic name.
 * @param topicName - The name of the topic to get the Redis subscribe token for.
 * @returns {string} The Redis subscribe token for the given topic name.
 */
export function getRedisSubToken(topicName: string) {
    return `sub:${getRedisToken(topicName)}`;
}
/**
 * Returns a Redis publish token for the given topic name.
 * @param topicName - The name of the topic to get the Redis publish token for.
 * @returns {string} The Redis publish token for the given topic name.
 */
export function getRedisPubToken(topicName: string) {
    return `pub:${getRedisToken(topicName)}`;
}
/**
 * Returns a Redis cache token for the 'cache' topic.
 * @returns {string} The Redis cache token.
 */
export function getRedisCacheToken() {
    return `${getRedisToken('cache')}`;
}