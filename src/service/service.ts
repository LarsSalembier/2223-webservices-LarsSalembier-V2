import Repository from '../repository/repository.js';
import PersonService from './person.js';

class Service {
  private readonly repository: Repository;

  public readonly personService: PersonService;

  constructor(repository: Repository) {
    this.repository = repository;

    this.personService = new PersonService(this.repository.personRepository);
  }
}

export default Service;
