import { Administrator } from '@prisma/client';
import ServiceError from './ServiceError.js';
import AdministratorRepository from '../repository/AdministratorRepository.js';
import RepositoryError, {
  RepositoryErrorType,
} from '../repository/RepositoryError.js';

class AdministratorService {
  private readonly administratorRepository;

  constructor(administratorRepository: AdministratorRepository) {
    this.administratorRepository = administratorRepository;
  }

  async getAll(): Promise<Administrator[]> {
    return this.administratorRepository.getAll();
  }

  async getById(auth0id: string): Promise<Administrator> {
    try {
      return await this.administratorRepository.getById(auth0id);
    } catch (err) {
      if (err instanceof RepositoryError) {
        if (err.type === RepositoryErrorType.NOT_FOUND) {
          throw ServiceError.notFound(err.message);
        }
      }
      throw err;
    }
  }

  async create(data: Administrator): Promise<Administrator> {
    try {
      return await this.administratorRepository.create(data);
    } catch (err) {
      if (err instanceof RepositoryError) {
        if (err.type === RepositoryErrorType.ALREADY_EXISTS) {
          throw ServiceError.conflict(err.message);
        }
      }
      throw err;
    }
  }

  async createMany(data: Administrator[]): Promise<Administrator[]> {
    return this.administratorRepository.createMany(data);
  }

  async update(
    auth0id: string,
    data: Partial<Omit<Administrator, 'auth0id'>>
  ): Promise<Administrator> {
    try {
      return await this.administratorRepository.update(auth0id, data);
    } catch (e) {
      if (e instanceof RepositoryError) {
        if (e.type === RepositoryErrorType.NOT_FOUND) {
          throw ServiceError.notFound(e.message);
        }
        if (e.type === RepositoryErrorType.ALREADY_EXISTS) {
          throw ServiceError.conflict(e.message);
        }
      }
      throw e;
    }
  }

  async delete(auth0id: string): Promise<Administrator> {
    try {
      return await this.administratorRepository.delete(auth0id);
    } catch (e) {
      if (e instanceof RepositoryError) {
        if (e.type === RepositoryErrorType.NOT_FOUND) {
          throw ServiceError.notFound(e.message);
        }
      }
      throw e;
    }
  }

  async deleteMany(auth0ids: string[]): Promise<number> {
    return this.administratorRepository.deleteMany(auth0ids);
  }

  async deleteAll(): Promise<number> {
    return this.administratorRepository.deleteAll();
  }
}

export default AdministratorService;
