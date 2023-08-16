import Joi from 'joi';
import { Context, Next } from 'koa';

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

        return resultObj;
      },
      {}
    );
  }

  public static validate(schema: Partial<ValidationSchema> = DEFAULT_SCHEMA) {
    const mergedSchema = { ...DEFAULT_SCHEMA, ...schema };

    return (ctx: Context, next: Next) => {
      const errors: { params?: ValidationErrorDetails } = {};

      const { error: paramsError, value: paramsValue }: Joi.ValidationResult =
        mergedSchema.params.validate(ctx.params, Validator.JOI_OPTIONS);

      if (paramsError) {
        errors.params = Validator.cleanupJoiError(paramsError);
      } else {
        ctx.params = paramsValue;
      }

      if (Object.keys(errors).length) {
        ctx.throw(
          400,
          'Validation failed, check details for more information',
          {
            code: 'VALIDATION_FAILED',
            details: errors,
          }
        );
      }

      return next();
    };
  }
}

export default Validator;
