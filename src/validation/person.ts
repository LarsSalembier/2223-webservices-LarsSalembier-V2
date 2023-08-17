import Joi from 'joi';
import { ValidationSchemas } from './validation.js';

const schemas: ValidationSchemas = {
  getAll: {},
  getById: {
    params: Joi.object({
      id: Joi.number().integer().required().min(1),
    }),
  },
  getGroups: {
    params: Joi.object({
      id: Joi.number().integer().required().min(1),
    }),
  },
  create: {
    body: Joi.object({
      name: Joi.string().max(100).min(3).required().trim(),
      email: Joi.string().email().max(100).trim().optional(),
      phoneNumber: Joi.string().max(30).trim().optional(),
      bio: Joi.string().max(500).trim().optional(),
      studiesOrJob: Joi.string().max(100).trim().optional(),
      birthdate: Joi.date().iso().greater('1900-01-01').less('now').optional(),
    }),
  },
  joinGroup: {
    params: Joi.object({
      id: Joi.number().integer().required().min(1),
    }),
    body: Joi.object({
      groupId: Joi.number().integer().required().min(1),
    }),
  },
  update: {
    params: Joi.object({
      id: Joi.number().integer().required().min(1),
    }),
    body: Joi.object({
      name: Joi.string().max(100).min(3).trim().optional(),
      email: Joi.string().email().max(100).trim().optional(),
      phoneNumber: Joi.string().max(30).trim().optional(),
      bio: Joi.string().max(500).trim().optional(),
      studiesOrJob: Joi.string().max(100).trim().optional(),
      birthdate: Joi.date().iso().greater('1900-01-01').less('now').optional(),
    }),
  },
  delete: {
    params: Joi.object({
      id: Joi.number().integer().required().min(1),
    }),
  },
  deleteAll: {},
  leaveGroup: {
    params: Joi.object({
      id: Joi.number().integer().required().min(1),
      groupId: Joi.number().integer().required().min(1),
    }),
  },
  leaveAllGroups: {
    params: Joi.object({
      id: Joi.number().integer().required().min(1),
    }),
  },
};

export default schemas;
