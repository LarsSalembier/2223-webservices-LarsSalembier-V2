import Service from '../service/service.js';
import AdministratorSeeder from './administrator.js';
import PersonSeeder from './person.js';

class Seeder {
  private readonly service: Service;

  private readonly personSeeder: PersonSeeder;

  private readonly administratorSeeder: AdministratorSeeder;

  private readonly groupSeeder: PersonSeeder;

  constructor(service: Service) {
    this.service = service;
    this.personSeeder = new PersonSeeder(this.service.personService);
    this.administratorSeeder = new AdministratorSeeder(
      this.service.administratorService
    );
    this.groupSeeder = new PersonSeeder(this.service.personService);
  }

  public async run(): Promise<void> {
    await this.personSeeder.run();
    await this.administratorSeeder.run();
    await this.groupSeeder.run();
  }
}

export default Seeder;
