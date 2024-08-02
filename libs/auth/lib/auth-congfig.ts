import * as Joi from "joi";

export const auth_schema = {
  JWT_SECRET: Joi.string().required(),
};