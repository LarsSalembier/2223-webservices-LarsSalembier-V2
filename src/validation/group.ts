import Joi from 'joi';
import { ValidationSchemas } from './validation.js';

const schemas: ValidationSchemas = {
  getAll: {},
  getById: {
    params: Joi.object({
      id: Joi.number().integer().required().min(1),
    }),
  },
  create: {
    body: Joi.object({
      name: Joi.string().max(100).min(3).trim().required(),
      description: Joi.string().max(500).trim().required(),
      color: Joi.string().max(30).trim().optional(),
      target: Joi.string().max(100).trim().optional(),
    }),
  },
  update: {
    params: Joi.object({
      id: Joi.number().integer().required().min(1),
    }),
    body: Joi.object({
      name: Joi.string().max(100).min(3).trim().optional(),
      description: Joi.string().max(500).trim().optional(),
      color: Joi.string().max(30).trim().optional(),
      target: Joi.string().max(100).trim().optional(),
    }),
  },
  delete: {
    params: Joi.object({
      id: Joi.number().integer().required().min(1),
    }),
  },
  deleteAll: {},
  count: {},
};

export default schemas;
