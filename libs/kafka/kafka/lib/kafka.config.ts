import * as Joi from "joi";

const schema = {
    PORT: Joi.number().min(3000).max(9000).default(3000),
    KAFKA_CLIENT_ID: Joi.string().default('kafka-cloud-client'),
    KAFKA_BROKERS: Joi.string().default('localhost:29092'),
};
export const KafkaCloudSchema = Joi.object(schema);
export type KafkaCloudConfigVariables = typeof schema;