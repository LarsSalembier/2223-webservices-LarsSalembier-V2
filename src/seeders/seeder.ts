import Service from '../service/service.js';
import AdministratorSeeder from './administrator.js';
import MembershipSeeder from './membership.js';
import PersonSeeder from './person.js';

class Seeder {
  private readonly service: Service;

  private readonly personSeeder: PersonSeeder;

  private readonly administratorSeeder: AdministratorSeeder;

  private readonly groupSeeder: PersonSeeder;

  private readonly membershipSeeder: MembershipSeeder;

  constructor(service: Service) {
    this.service = service;
    this.personSeeder = new PersonSeeder(this.service.personService);
    this.administratorSeeder = new AdministratorSeeder(
      this.service.administratorService
    );
    this.groupSeeder = new PersonSeeder(this.service.personService);
    this.membershipSeeder = new MembershipSeeder(
      this.service.membershipService
    );
  }

  public async run(): Promise<void> {
    await this.administratorSeeder.run();
    const people = await this.personSeeder.run();
    const groups = await this.groupSeeder.run();
    const personIds = people.map((person) => person.id);
    const groupIds = groups.map((group) => group.id);
    await this.membershipSeeder.run(personIds, groupIds);
  }
}

export default Seeder;
