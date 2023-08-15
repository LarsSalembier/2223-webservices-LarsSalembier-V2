import Repository from 'repository/repository.js';
import PersonSeeder from './person.js';

class Seeder {
  private readonly repository: Repository;

  public readonly personSeed: PersonSeeder;

  constructor(repository: Repository) {
    this.repository = repository;
    this.personSeed = new PersonSeeder(this.repository.personRepository);
  }

  public async run(): Promise<void> {
    await this.personSeed.run();
  }
}

export default Seeder;
