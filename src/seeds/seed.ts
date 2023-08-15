import Repository from 'repository/repository.js';
import PersonSeed from './person.js';

class Seed {
  private readonly repository: Repository;

  public readonly personSeed: PersonSeed;

  constructor(repository: Repository) {
    this.repository = repository;
    this.personSeed = new PersonSeed(this.repository.personRepository);
  }
}

export default Seed;
