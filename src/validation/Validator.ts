import Joi from 'joi';
import { Context, Next } from 'koa';
import ServiceError, { ServiceErrorType } from '../service/ServiceError.js';

interface ErrorDetail {
  type: string;
  message: string;
}

interface ValidationErrorDetails {
  [key: string]: ErrorDetail[];
}

export interface ValidationSchema {
  params: Joi.Schema;
  query: Joi.Schema;
  body: Joi.Schema;
}

export interface ValidationSchemas {
  [key: string]: Partial<ValidationSchema>;
}

const DEFAULT_SCHEMA: ValidationSchema = {
  query: Joi.object(),
  body: Joi.object(),
  params: Joi.object(),
};

class Validator {
  static JOI_OPTIONS: Joi.ValidationOptions = {
    abortEarly: true,
    allowUnknown: false,
    convert: true,
    presence: 'required',
  };

  private static cleanupJoiError(
    error: Joi.ValidationError
  ): ValidationErrorDetails {
    return error.details.reduce(
      (resultObj: ValidationErrorDetails, { message, path, type }) => {
        const joinedPath = path.join('.') || 'value';
        const result = { ...resultObj };
        if (!resultObj[joinedPath]) {
          result[joinedPath] = [];
        }
        if (result[joinedPath] !== undefined) {
          result[joinedPath]?.push({
            type,
            message,
          });
        }

        return result;
      },
      {}
    );
  }

  public static validate(schema: Partial<ValidationSchema> = DEFAULT_SCHEMA) {
    const mergedSchema = { ...DEFAULT_SCHEMA, ...schema };

    return (ctx: Context, next: Next) => {
      const errors: {
        params?: ValidationErrorDetails;
        query?: ValidationErrorDetails;
        body?: ValidationErrorDetails;
      } = {};

      const { error: paramsError, value: paramsValue }: Joi.ValidationResult =
        mergedSchema.params.validate(ctx.params, Validator.JOI_OPTIONS);
      const { error: queryError, value: queryValue }: Joi.ValidationResult =
        mergedSchema.query.validate(ctx.query, Validator.JOI_OPTIONS);
      const { error: bodyError, value: bodyValue }: Joi.ValidationResult =
        mergedSchema.body.validate(ctx.request.body, Validator.JOI_OPTIONS);

      if (paramsError) {
        errors.params = Validator.cleanupJoiError(paramsError);
      } else {
        ctx.params = paramsValue;
      }

      if (queryError) {
        errors.query = Validator.cleanupJoiError(queryError);
      } else {
        ctx.query = queryValue;
      }

      if (bodyError) {
        errors.body = Validator.cleanupJoiError(bodyError);
      } else {
        ctx.request.body = bodyValue;
      }

      if (Object.keys(errors).length) {
        const error = new ServiceError(
          ServiceErrorType.VALIDATION_FAILED,
          'Validation failed, check details for more information',
          errors
        );

        ctx.throw(400, '', error);
      }

      return next();
    };
  }
}

export default Validator;
