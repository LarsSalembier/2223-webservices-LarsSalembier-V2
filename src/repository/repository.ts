import { PrismaClient } from '@prisma/client';
import PersonRepository from './person.js';

class Repository {
  public readonly personRepository: PersonRepository;

  constructor(prismaClient: PrismaClient) {
    this.personRepository = new PersonRepository(prismaClient);
  }
}

export default Repository;
