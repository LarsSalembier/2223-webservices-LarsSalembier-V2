import { Person } from '@prisma/client';
import PrismaProvider from 'core/PrismaProvider.js';

class PersonService {
  private static prisma = PrismaProvider.getClient();
  // geen repo nodig, we doen alles vanaf hier straks

  public static async getAll(): Promise<Person[]> {
    const people = await this.prisma.person.findMany();

    return people;
  }

  public static async getById(id: number): Promise<Person | null> {
    const person = await this.prisma.person.findUnique({
      where: {
        id,
      },
    });

    return person;
  }

  public static async create(personData: Omit<Person, 'id'>): Promise<Person> {
    const person = await this.prisma.person.create({
      data: personData,
    });

    return person;
  }

  public static async update(
    id: number,
    newData: Partial<Omit<Person, 'id'>>
  ): Promise<Person | null> {
    const person = await this.prisma.person.update({
      where: {
        id,
      },
      data: newData,
    });

    if (!person) {
      return null;
    }

    return person;
  }

  public static async remove(id: number): Promise<boolean> {
    const person = await this.prisma.person.delete({
      where: {
        id,
      },
    });

    if (!person) {
      return false;
    }

    return true;
  }
}

export default PersonService;
