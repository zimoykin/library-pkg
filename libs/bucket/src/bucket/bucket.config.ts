import * as Joi from "joi";

export const bucket_schema = {
    CL_TOKEN: Joi.string().required(),
    CL_ACCESS_ID: Joi.string().required(),
    CL_SECRET_KEY: Joi.string().required(),
    CL_ENDPOINT: Joi.string().required(),
};