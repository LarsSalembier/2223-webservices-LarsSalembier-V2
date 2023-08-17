import { PrismaClient } from '@prisma/client';
import AdministratorRepository from './administrator.js';
import GroupRepository from './group.js';
import PersonRepository from './person.js';
import MembershipRepository from './membership.js';

class Repository {
  public readonly personRepository: PersonRepository;

  public readonly administratorRepository: AdministratorRepository;

  public readonly groupRepository: GroupRepository;

  public readonly membershipRepository: MembershipRepository;

  constructor(prismaClient: PrismaClient) {
    this.personRepository = new PersonRepository(prismaClient);
    this.administratorRepository = new AdministratorRepository(prismaClient);
    this.groupRepository = new GroupRepository(prismaClient);
    this.membershipRepository = new MembershipRepository(prismaClient);
  }
}

export default Repository;
