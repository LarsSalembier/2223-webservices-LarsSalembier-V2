import { Context, Next } from 'koa';
import config from 'config';
import CustomLogger from './CustomLogger.js';
import ServiceError, { ServiceErrorType } from './ServiceError.js';

const NODE_ENV = config.get('env');

type ErrorBody = {
  type: ServiceErrorType;
  message: string;
  details: Record<string, unknown>;
  stack?: string;
};

interface ExtendedError extends Error {
  status?: number;
  type?: ServiceErrorType;
  details?: Record<string, unknown>;
}

class ErrorHandler {
  private readonly logger: CustomLogger;

  constructor(logger: CustomLogger) {
    this.logger = logger;
  }

  public async koaMiddleware(ctx: Context, next: Next) {
    try {
      await next();

      if (ctx.status === 404) {
        ctx.body = {
          type: ServiceErrorType.NOT_FOUND,
          message: `Unknown resource: ${ctx.url}`,
          details: {},
        };
      }

      ctx.status = 404;
    } catch (err) {
      if (!(err instanceof Error)) {
        throw new TypeError('Caught exception is not an Error instance.');
      }

      const safeError: ExtendedError = err;

      this.logger.error(`Error occured while handling a request: ${err}`);

      let statusCode = safeError.status || 500;

      const errorBody: ErrorBody = {
        type: safeError.type || ServiceErrorType.INTERNAL_SERVER_ERROR,
        message: safeError.message,
        details: safeError.details || {},
        stack: NODE_ENV !== 'production' ? err.stack : undefined,
      };

      if (err instanceof ServiceError) {
        switch (err.type) {
          case ServiceErrorType.VALIDATION_FAILED:
            statusCode = 400;
            break;
          case ServiceErrorType.NOT_FOUND:
            statusCode = 404;
            break;
          case ServiceErrorType.FORBIDDEN:
            statusCode = 403;
            break;
          case ServiceErrorType.UNAUTHORIZED:
            statusCode = 401;
            break;
          case ServiceErrorType.CONFLICT:
            statusCode = 409;
            break;
          case ServiceErrorType.INTERNAL_SERVER_ERROR:
            statusCode = 500;
            break;
          default:
            statusCode = 500;
        }

        ctx.status = statusCode;
        ctx.body = errorBody;
      }
    }
  }
}

export default ErrorHandler;
