import { PrismaClient } from '@prisma/client';
import PersonService from './person.js';

class Service {
  public readonly personService: PersonService;

  constructor(prismaClient: PrismaClient) {
    this.personService = new PersonService(prismaClient);
  }
}

export default Service;
