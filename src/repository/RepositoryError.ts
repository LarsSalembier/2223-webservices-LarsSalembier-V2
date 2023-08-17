export enum RepositoryErrorType {
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
}

class RepositoryError extends Error {
  public readonly type: RepositoryErrorType;

  constructor(type: RepositoryErrorType, message: string) {
    super(message);
    this.name = 'RepositoryError';
    this.type = type;
  }

  static notFound(message: string): RepositoryError {
    return new RepositoryError(RepositoryErrorType.NOT_FOUND, message);
  }

  static alreadyExists(message: string): RepositoryError {
    return new RepositoryError(RepositoryErrorType.ALREADY_EXISTS, message);
  }

  static conflict(message: string): RepositoryError {
    return new RepositoryError(RepositoryErrorType.CONFLICT, message);
  }
}

export default RepositoryError;
