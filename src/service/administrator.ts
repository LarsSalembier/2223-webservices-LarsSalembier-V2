import { Administrator, PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';
import ServiceError from '../core/ServiceError.js';

class AdministratorService {
  private readonly prisma;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getAll(): Promise<Administrator[]> {
    return this.prisma.administrator.findMany();
  }

  async getById(auth0id: string): Promise<Administrator> {
    const administrator = await this.prisma.administrator.findUnique({
      where: {
        auth0id,
      },
    });

    if (!administrator) {
      throw ServiceError.notFound(
        `There is no administrator with auth0id ${auth0id}`
      );
    }

    return administrator;
  }

  async create(data: Administrator): Promise<Administrator> {
    return this.prisma.administrator.create({
      data,
    });
  }

  async createMany(data: Administrator[]): Promise<Administrator[]> {
    const creationPromises = data.map((administrator) =>
      this.create(administrator)
    );
    return Promise.all(creationPromises);
  }

  async update(
    auth0id: string,
    data: Partial<Omit<Administrator, 'auth0id'>>
  ): Promise<Administrator> {
    try {
      return await this.prisma.administrator.update({
        where: {
          auth0id,
        },
        data,
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw ServiceError.notFound(
            `There is no administrator with auth0id ${auth0id}`
          );
        }
      }
      throw e;
    }
  }

  async delete(auth0id: string): Promise<Administrator> {
    try {
      return await this.prisma.administrator.delete({
        where: {
          auth0id,
        },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError)
        if (e.code === 'P2025') {
          throw ServiceError.notFound(
            `There is no administrator with auth0id ${auth0id}`
          );
        }
      throw e;
    }
  }

  async deleteMany(auth0ids: string[]): Promise<number> {
    const batchPayload = await this.prisma.administrator.deleteMany({
      where: {
        auth0id: {
          in: auth0ids,
        },
      },
    });

    return batchPayload.count;
  }

  async deleteAll(): Promise<number> {
    const batchPayload = await this.prisma.administrator.deleteMany();

    return batchPayload.count;
  }

  async count(): Promise<number> {
    return this.prisma.administrator.count();
  }
}

export default AdministratorService;
