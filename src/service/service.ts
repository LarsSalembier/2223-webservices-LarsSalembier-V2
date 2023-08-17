import PersonService from './person.js';
import AdministratorService from './administrator.js';
import GroupService from './group.js';
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
