import PersonService from './PersonService.js';
import AdministratorService from './AdministratorService.js';
import GroupService from './GroupService.js';
import Repository from '../repository/Repository.js';

class Service {
  public readonly personService: PersonService;

  public readonly administratorService: AdministratorService;

  public readonly groupService: GroupService;

  constructor(repository: Repository) {
    this.personService = new PersonService(
      repository.personRepository,
      repository.membershipRepository,
      repository.groupRepository
    );
    this.administratorService = new AdministratorService(
      repository.administratorRepository
    );
    this.groupService = new GroupService(
      repository.groupRepository,
      repository.membershipRepository,
      repository.personRepository
    );
  }
}

export default Service;
