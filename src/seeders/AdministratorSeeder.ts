import { faker } from '@faker-js/faker';
import { Administrator } from '@prisma/client';
import AdministratorService from '../service/AdministratorService.js';

class AdministratorSeeder {
  private readonly service: AdministratorService;

  constructor(service: AdministratorService) {
    this.service = service;
  }

  public static generate(): Administrator {
    return {
      auth0id: faker.string.uuid(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
    };
  }

  private add(): Promise<Administrator> {
    return this.service.create(AdministratorSeeder.generate());
  }

  async run(): Promise<Administrator[]> {
    const promises = Array.from({ length: 10 }).map(() => this.add());
    return Promise.all(promises);
  }
}

export default AdministratorSeeder;
