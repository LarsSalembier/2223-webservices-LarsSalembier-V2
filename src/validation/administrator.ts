import Joi from 'joi';
import { ValidationSchemas } from './validation.js';

const schemas: ValidationSchemas = {
  getAll: {},
  getById: {
    params: Joi.object({
      auth0id: Joi.string().required(),
    }),
  },
  create: {
    body: Joi.object({
      auth0id: Joi.string().required(),
      username: Joi.string().required().max(30).min(3),
      email: Joi.string().required().email(),
    }),
  },
  update: {
    params: Joi.object({
      auth0id: Joi.string().required(),
    }),
    body: Joi.object({
      username: Joi.string().max(30).min(3).optional(),
      email: Joi.string().email().optional(),
    }),
  },
  delete: {
    params: Joi.object({
      auth0id: Joi.string().required(),
    }),
  },
  deleteAll: {},
  count: {},
};

export default schemas;
