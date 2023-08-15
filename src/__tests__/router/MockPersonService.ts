/* eslint-disable class-methods-use-this */
import { Person } from '@prisma/client';
import CustomLogger from '../../core/CustomLogger.js';
import CustomPrismaClient from '../../core/CustomPrismaClient.js';
import PersonSeeder from '../../seeders/person.js';
import PersonService from '../../service/person.js';

const people = Array.from({ length: 10 }).map(() =>
  PersonSeeder.generatePerson()
);

const peopleWithIds = people.map((person, index) => ({
  ...person,
  id: index + 1,
}));

class MockPersonService extends PersonService {
  constructor() {
    super(new CustomPrismaClient(new CustomLogger('')));
  }

  public override async getAll() {
    return peopleWithIds;
  }

  public override async getById(id: number) {
    return peopleWithIds.find((person) => person.id === id) ?? null;
  }

  public override async create(personData: Omit<Person, 'id'>) {
    const newPerson = { ...personData, id: peopleWithIds.length + 1 };
    peopleWithIds.push(newPerson);
    return newPerson;
  }

  public override async createMany(
    personData: Omit<Person, 'id'>[]
  ): Promise<Person[]> {
    const newPeople = personData.map((person, index) => ({
      ...person,
      id: peopleWithIds.length + index + 1,
    }));
    peopleWithIds.push(...newPeople);
    return newPeople;
  }

  public override async update(
    id: number,
    newData: Partial<Omit<Person, 'id'>>
  ) {
    const person = await this.getById(id);
    if (!person) return null;
    const updatedPerson = { ...person, ...newData };
    peopleWithIds[id - 1] = updatedPerson;
    return updatedPerson;
  }

  public override async delete(id: number) {
    const person = await this.getById(id);
    if (!person) return false;
    peopleWithIds.splice(id - 1, 1);
    return true;
  }

  public override async deleteMany(ids: number[]) {
    let amountDeleted = 0;

    ids.forEach((id) => {
      const person = peopleWithIds.find((p) => p.id === id);
      if (person) {
        peopleWithIds.splice(id - 1, 1);
        amountDeleted += 1;
      }
    });

    return amountDeleted;
  }

  public override async deleteAll() {
    const amount = peopleWithIds.length;
    peopleWithIds.splice(0, peopleWithIds.length);
    return amount;
  }

  public override async count() {
    return peopleWithIds.length;
  }
}

export default MockPersonService;
