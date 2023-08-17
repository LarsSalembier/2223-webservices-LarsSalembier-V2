import { Group, Prisma, PrismaClient } from '@prisma/client';
import RepositoryError from './RepositoryError.js';

class GroupRepository {
  private readonly prisma;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async getAll(): Promise<Group[]> {
    return this.prisma.group.findMany();
  }

  async getById(id: number): Promise<Group> {
    const data = await this.prisma.group.findUnique({
      where: {
        id,
      },
    });

    if (!data) {
      throw RepositoryError.notFound(`There is no group with id ${id}`);
    }

    return data;
  }

  async create(data: Omit<Group, 'id'>): Promise<Group> {
    return this.prisma.group.create({
      data,
    });
  }

  async createMany(data: Omit<Group, 'id'>[]): Promise<Group[]> {
    return Promise.all(data.map((entity) => this.create(entity)));
  }

  async update(id: number, data: Partial<Omit<Group, 'id'>>): Promise<Group> {
    try {
      return await this.prisma.group.update({
        where: {
          id,
        },
        data,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw RepositoryError.notFound(`There is no group with id ${id}`);
        }
      }
      throw e;
    }
  }

  async delete(id: number): Promise<Group> {
    try {
      return await this.prisma.group.delete({
        where: {
          id,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw RepositoryError.notFound(`There is no group with id ${id}`);
        }

        if (e.code === 'P2003') {
          throw RepositoryError.conflict(
            `Group with id ${id} cannot be deleted because it is in use`
          );
        }
      }
      throw e;
    }
  }

  async deleteMany(ids: number[]): Promise<number> {
    try {
      const batchPayload = await this.prisma.group.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });

      return batchPayload.count;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2003') {
          throw RepositoryError.conflict(
            `One or more groups cannot be deleted because they are in use`
          );
        }
      }
      throw e;
    }
  }

  async deleteAll(): Promise<number> {
    try {
      const batchPayload = await this.prisma.group.deleteMany({});

      return batchPayload.count;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2003') {
          throw RepositoryError.conflict(
            `One or more groups cannot be deleted because they are in use`
          );
        }
      }
      throw e;
    }
  }
}

export default GroupRepository;
