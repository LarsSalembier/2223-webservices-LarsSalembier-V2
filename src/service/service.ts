import { PrismaClient } from '@prisma/client';
import PersonService from './person.js';
import AdministratorService from './administrator.js';
import GroupService from './group.js';

class Service {
  public readonly personService: PersonService;

  public readonly administratorService: AdministratorService;

  public readonly groupService: GroupService;

  constructor(prismaClient: PrismaClient) {
    this.personService = new PersonService(prismaClient);
    this.administratorService = new AdministratorService(prismaClient);
    this.groupService = new GroupService(prismaClient);
  }
}

export default Service;
