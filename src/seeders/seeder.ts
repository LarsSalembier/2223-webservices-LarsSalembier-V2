import CustomLogger from '../core/CustomLogger.js';
import Service from '../service/service.js';
import AdministratorSeeder from './administrator.js';
import GroupSeeder from './group.js';
import MembershipSeeder from './membership.js';
import PersonSeeder from './person.js';

class Seeder {
  private readonly service: Service;

  private readonly personSeeder: PersonSeeder;

  private readonly administratorSeeder: AdministratorSeeder;

  private readonly groupSeeder: GroupSeeder;

  private readonly membershipSeeder: MembershipSeeder;

  private readonly logger: CustomLogger;

  constructor(service: Service, logger: CustomLogger) {
    this.service = service;
    this.logger = logger;
    this.personSeeder = new PersonSeeder(this.service.personService);
    this.administratorSeeder = new AdministratorSeeder(
      this.service.administratorService
    );
    this.groupSeeder = new GroupSeeder(this.service.groupService);
    this.membershipSeeder = new MembershipSeeder(
      this.service.membershipService
    );
  }

  public async clearDb() {
    await this.service.membershipService.deleteAll();
    await this.service.groupService.deleteAll();
    await this.service.personService.deleteAll();
    await this.service.administratorService.deleteAll();
  }

  public async run(): Promise<void> {
    try {
      await this.clearDb();
      await this.administratorSeeder.run();
      const people = await this.personSeeder.run();
      const groups = await this.groupSeeder.run();
      const personIds = people.map((person) => person.id);
      const groupIds = groups.map((group) => group.id);
      await this.membershipSeeder.run(personIds, groupIds);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
    }
  }
}

export default Seeder;
