import Service from '../service/service.js';
import AdministratorSeeder from './administrator.js';
import PersonSeeder from './person.js';

class Seeder {
  private readonly service: Service;

  public readonly personSeeder: PersonSeeder;

  public readonly administratorSeeder: AdministratorSeeder;

  constructor(service: Service) {
    this.service = service;
    this.personSeeder = new PersonSeeder(this.service.personService);
    this.administratorSeeder = new AdministratorSeeder(
      this.service.administratorService
    );
  }

  public async run(): Promise<void> {
    await this.personSeeder.run();
    await this.administratorSeeder.run();
  }
}

export default Seeder;
