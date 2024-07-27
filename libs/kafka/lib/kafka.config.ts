import * as Joi from "joi";

export const kafka_schema = {
    KAFKA_CLIENT_ID: Joi.string().default('kafka-cloud-client'),
    KAFKA_BROKERS: Joi.string().default('localhost:29092'),
};