import { Person, Prisma, PrismaClient } from '@prisma/client';
import RepositoryError from './RepositoryError.js';

class PersonRepository {
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
      throw RepositoryError.notFound(`There is no person with id ${id}`);
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
          throw RepositoryError.notFound(`There is no person with id ${id}`);
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
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw RepositoryError.notFound(`There is no person with id ${id}`);
        }
        if (e.code === 'P2003') {
          throw RepositoryError.conflict(
            `Person with id ${id} cannot be deleted because it is in use`
          );
        }
      }
      throw e;
    }
  }

  async deleteMany(ids: number[]): Promise<number> {
    try {
      const batchPayload = await this.prisma.person.deleteMany({
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
            `Some of the people cannot be deleted because they are in use`
          );
        }
      }
      throw e;
    }
  }

  async deleteAll(): Promise<number> {
    try {
      const batchPayload = await this.prisma.person.deleteMany({});

      return batchPayload.count;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2003') {
          throw RepositoryError.conflict(
            `Some of the people cannot be deleted because they are in use`
          );
        }
      }
      throw e;
    }
  }
}

export default PersonRepository;
