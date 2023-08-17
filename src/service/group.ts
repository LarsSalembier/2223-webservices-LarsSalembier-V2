import { Group, Prisma, PrismaClient } from '@prisma/client';
import ServiceError from '../core/ServiceError.js';

class GroupService {
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
      throw ServiceError.notFound(`There is no group with id ${id}`);
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
          throw ServiceError.notFound(`There is no group with id ${id}`);
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
      if (e instanceof Prisma.PrismaClientKnownRequestError)
        if (e.code === 'P2025') {
          throw ServiceError.notFound(`There is no group with id ${id}`);
        }
      throw e;
    }
  }

  async deleteMany(ids: number[]): Promise<number> {
    const batchPayload = await this.prisma.group.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return batchPayload.count;
  }

  async deleteAll(): Promise<number> {
    const batchPayload = await this.prisma.group.deleteMany({});

    return batchPayload.count;
  }
}

export default GroupService;
