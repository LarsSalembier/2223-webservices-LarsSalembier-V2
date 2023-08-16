export enum ServiceErrorType {
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

class ServiceError extends Error {
  public readonly type: ServiceErrorType;

  public readonly name = 'ServiceError';

  public readonly details: Record<string, unknown>;

  constructor(type: ServiceErrorType, message?: string, details = {}) {
    super(message);
    this.type = type;
    this.details = details;
  }

  static notFound(message?: string, details = {}): ServiceError {
    return new ServiceError(
      ServiceErrorType.NOT_FOUND,
      message || 'Not found',
      details
    );
  }

  static validationFailed(message?: string, details = {}): ServiceError {
    return new ServiceError(
      ServiceErrorType.VALIDATION_FAILED,
      message || 'Validation failed',
      details
    );
  }

  static unauthorized(message?: string, details = {}): ServiceError {
    return new ServiceError(
      ServiceErrorType.UNAUTHORIZED,
      message || 'Unauthorized',
      details
    );
  }

  static forbidden(message?: string, details = {}): ServiceError {
    return new ServiceError(
      ServiceErrorType.FORBIDDEN,
      message || 'Forbidden',
      details
    );
  }

  static conflict(message?: string, details = {}): ServiceError {
    return new ServiceError(
      ServiceErrorType.CONFLICT,
      message || 'Conflict',
      details
    );
  }

  static internalServerError(message?: string, details = {}): ServiceError {
    return new ServiceError(
      ServiceErrorType.INTERNAL_SERVER_ERROR,
      message || 'Internal server error',
      details
    );
  }
}

export default ServiceError;
