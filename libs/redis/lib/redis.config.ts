import * as Joi from "joi";

export const kafka_schema = {
    REDIS_HOST: Joi.string().default('127.0.0.1'),
    REDIS_PORT: Joi.string().default('6379'),
    REDIS_PASSWORD: Joi.string().default('redis-password'),
};