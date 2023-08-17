import { Person, Prisma, PrismaClient } from '@prisma/client';
import ServiceError from '../core/ServiceError.js';

class PersonService {
  private readonly prisma;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async getAll(): Promise<Person[]> {
    return this.prisma.person.findMany();
  }

  async getById(id: number): Promise<Person> {
    const data = await this.prisma.person.findUnique({
      where: {
        id,
      },
    });

    if (!data) {
      throw ServiceError.notFound(`There is no person with id ${id}`);
    }

    return data;
  }

  async create(data: Omit<Person, 'id'>): Promise<Person> {
    return this.prisma.person.create({
      data,
    });
  }

  async createMany(data: Omit<Person, 'id'>[]): Promise<Person[]> {
    return Promise.all(data.map((entity) => this.create(entity)));
  }

  async update(id: number, data: Partial<Omit<Person, 'id'>>): Promise<Person> {
    try {
      return await this.prisma.person.update({
        where: {
          id,
        },
        data,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw ServiceError.notFound(`There is no person with id ${id}`);
        }
      }
      throw e;
    }
  }

  async delete(id: number): Promise<Person> {
    try {
      return await this.prisma.person.delete({
        where: {
          id,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError)
        if (e.code === 'P2025') {
          throw ServiceError.notFound(`There is no person with id ${id}`);
        }
      throw e;
    }
  }

  async deleteMany(ids: number[]): Promise<number> {
    const batchPayload = await this.prisma.person.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return batchPayload.count;
  }

  async deleteAll(): Promise<number> {
    const batchPayload = await this.prisma.person.deleteMany({});

    return batchPayload.count;
  }
}

export default PersonService;
