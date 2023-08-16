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
      name: Joi.string().max(100).min(3).required().trim(),
      email: Joi.string().email().trim().optional(),
      phoneNumber: Joi.string().max(20).trim().optional(),
      bio: Joi.string().max(500).trim().optional(),
      studiesOrJob: Joi.string().max(100).trim().optional(),
      birthdate: Joi.date().iso().greater('1900-01-01').less('now').optional(),
    }),
  },
  update: {
    params: Joi.object({
      id: Joi.number().integer().required().min(1),
    }),
    body: Joi.object({
      name: Joi.string().max(100).trim(),
      email: Joi.string().email().trim(),
      phoneNumber: Joi.string().max(20).trim(),
      bio: Joi.string().max(500).trim(),
      studiesOrJob: Joi.string().max(100).trim(),
      birthdate: Joi.date().iso().greater('1900-01-01').less('now'),
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
