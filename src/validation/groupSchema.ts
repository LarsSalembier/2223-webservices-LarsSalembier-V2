import Joi from 'joi';
import { ValidationSchemas } from './Validator.js';

const schemas: ValidationSchemas = {
  getAll: {},
  getById: {
    params: Joi.object({
      id: Joi.number().integer().required().min(1),
    }),
  },
  getMembers: {
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
  addMember: {
    params: Joi.object({
      id: Joi.number().integer().required().min(1),
    }),
    body: Joi.object({
      personId: Joi.number().integer().required().min(1),
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
  removeMember: {
    params: Joi.object({
      id: Joi.number().integer().required().min(1),
      memberId: Joi.number().integer().required().min(1),
    }),
  },
  removeAllMembers: {
    params: Joi.object({
      id: Joi.number().integer().required().min(1),
    }),
  },
};

export default schemas;
