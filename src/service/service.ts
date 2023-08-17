import { PrismaClient } from '@prisma/client';
import PersonService from './person.js';
import AdministratorService from './administrator.js';
import GroupService from './group.js';
import MembershipService from './membership.js';

class Service {
  public readonly personService: PersonService;

  public readonly administratorService: AdministratorService;

  public readonly groupService: GroupService;

  public readonly membershipService: MembershipService;

  constructor(prismaClient: PrismaClient) {
    this.personService = new PersonService(prismaClient);
    this.administratorService = new AdministratorService(prismaClient);
    this.groupService = new GroupService(prismaClient);
    this.membershipService = new MembershipService(prismaClient);
  }
}

export default Service;
