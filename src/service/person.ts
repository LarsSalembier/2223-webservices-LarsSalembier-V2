import { Person, PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';

class PersonService {
  private readonly prisma;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async getAll(): Promise<Person[]> {
    const people = this.prisma.person.findMany();

    return people;
  }

  async getById(id: number): Promise<Person | null> {
    const person = this.prisma.person.findUnique({
      where: {
        id,
      },
    });

    return person;
  }

  async create(person: Omit<Person, 'id'>): Promise<Person> {
    const createdPerson = this.prisma.person.create({
      data: person,
    });

    return createdPerson;
  }

  async createMany(people: Omit<Person, 'id'>[]): Promise<Person[]> {
    const creationPromises = people.map(async (person) => {
      return this.prisma.person.create({
        data: person,
      });
    });

    const createdPeople = await Promise.all(creationPromises);

    return createdPeople;
  }

  async update(
    id: number,
    person: Partial<Omit<Person, 'id'>>
  ): Promise<Person | null> {
    try {
      return await this.prisma.person.update({
        where: {
          id,
        },
        data: person,
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          return null;
        }
      }
      throw e;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      return !!(await this.prisma.person.delete({
        where: {
          id,
        },
      }));
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError)
        if (e.code === 'P2025') {
          return false;
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

  async count(): Promise<number> {
    return this.prisma.person.count();
  }
}

export default PersonService;
