import Joi from 'joi';
import { ValidationSchema } from './validation.js';

interface ValidationSchemas {
  [key: string]: Partial<ValidationSchema>;
}

const schemas: ValidationSchemas = {
  getAllPeople: {},
  getPeopleCount: {},
  getPersonById: {
    params: Joi.object({
      id: Joi.number().integer().required().min(1),
    }),
  },
  createPerson: {
    body: Joi.object({
      name: Joi.string().max(100).required().trim(),
      email: Joi.string().email().trim(),
      phoneNumber: Joi.string().max(20).trim(),
      bio: Joi.string().max(500).trim(),
      studiesOrJob: Joi.string().max(100).trim(),
      birthdate: Joi.date().iso().greater('1900-01-01').less('now'),
    }),
  },
  updatePerson: {
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
  deletePerson: {
    params: Joi.object({
      id: Joi.number().integer().required().min(1),
    }),
  },
  deleteAllPeople: {},
};

export default schemas;
