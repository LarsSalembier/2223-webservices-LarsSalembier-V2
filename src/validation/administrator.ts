import Joi from 'joi';
import { ValidationSchemas } from './validation.js';

const schemas: ValidationSchemas = {
  getAll: {},
  getByAuth0Id: {
    params: Joi.object({
      auth0Id: Joi.string().required(),
    }),
  },
  create: {
    body: Joi.object({
      auth0Id: Joi.string().required(),
      username: Joi.string().required().max(100).min(3),
      email: Joi.string().required().email(),
    }),
  },
  update: {
    params: Joi.object({
      auth0Id: Joi.string().required(),
    }),
    body: Joi.object({
      username: Joi.string().required().max(100).min(3),
      email: Joi.string().required().email(),
    }),
  },
  delete: {
    params: Joi.object({
      auth0Id: Joi.string().required(),
    }),
  },
  deleteAll: {},
  count: {},
};

export default schemas;
