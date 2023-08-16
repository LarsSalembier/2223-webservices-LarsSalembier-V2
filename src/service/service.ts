import { PrismaClient } from '@prisma/client';
import PersonService from './person.js';
import AdministratorService from './administrator.js';

class Service {
  public readonly personService: PersonService;

  public readonly administratorService: AdministratorService;

  constructor(prismaClient: PrismaClient) {
    this.personService = new PersonService(prismaClient);
    this.administratorService = new AdministratorService(prismaClient);
  }
}

export default Service;
