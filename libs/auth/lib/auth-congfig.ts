import * as Joi from "joi";

export const kafka_schema = {
  JWT_SECRET: Joi.string().required(),
};