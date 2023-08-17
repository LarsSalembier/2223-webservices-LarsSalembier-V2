import { Administrator, Prisma, PrismaClient } from '@prisma/client';
import RepositoryError from './RepositoryError.js';

class AdministratorRepository {
  private readonly prisma;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getAll(): Promise<Administrator[]> {
    return this.prisma.administrator.findMany();
  }

  async getById(auth0id: string): Promise<Administrator> {
    const data = await this.prisma.administrator.findUnique({
      where: {
        auth0id,
      },
    });

    if (!data) {
      throw RepositoryError.notFound(
        `There is no administrator with auth0id ${auth0id}`
      );
    }

    return data;
  }

  async create(data: Administrator): Promise<Administrator> {
    try {
      return await this.prisma.administrator.create({ data });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw RepositoryError.alreadyExists(
            `An administrator with auth0id ${data.auth0id} and/or username ${data.username} already exists`
          );
        }
      }
      throw err;
    }
  }

  async createMany(data: Administrator[]): Promise<Administrator[]> {
    return Promise.all(data.map((entity) => this.create(entity)));
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
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw RepositoryError.notFound(
            `There is no administrator with auth0id ${auth0id}`
          );
        }
        if (e.code === 'P2002') {
          throw RepositoryError.alreadyExists(
            `That username (${data.username}) is already in use`
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
      if (e instanceof Prisma.PrismaClientKnownRequestError)
        if (e.code === 'P2025') {
          throw RepositoryError.notFound(
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
}

export default AdministratorRepository;
