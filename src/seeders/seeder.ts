import Service from '../service/service.js';
import PersonSeeder from './person.js';

class Seeder {
  private readonly service: Service;

  public readonly personSeed: PersonSeeder;

  constructor(service: Service) {
    this.service = service;
    this.personSeed = new PersonSeeder(this.service.personService);
  }

  public async run(): Promise<void> {
    await this.personSeed.run();
  }
}

export default Seeder;
