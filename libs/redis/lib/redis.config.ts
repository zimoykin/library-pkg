import * as Joi from "joi";

/**
 * Defines the schema for Redis configuration options.
 * 
 * @property {string} REDIS_HOST - The hostname or IP address of the Redis server. Defaults to '127.0.0.1'.
 * @property {string} REDIS_PORT - The port number of the Redis server. Defaults to '6379'.
 * @property {string} REDIS_PASSWORD - The password to authenticate with the Redis server. Defaults to 'redis-password'.
 */
export const redis_schema = {
    REDIS_HOST: Joi.string().default('127.0.0.1'),
    REDIS_PORT: Joi.string().default('6379'),
    REDIS_PASSWORD: Joi.string().default('redis-password'),
};