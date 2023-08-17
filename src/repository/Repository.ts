import { PrismaClient } from '@prisma/client';
import AdministratorRepository from './AdministratorRepository.js';
import GroupRepository from './GroupRepository.js';
import PersonRepository from './PersonRepository.js';
import MembershipRepository from './MembershipRepository.js';

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
