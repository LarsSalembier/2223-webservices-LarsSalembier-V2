import { faker } from '@faker-js/faker';
import { Person } from '@prisma/client';
import PersonService from '../service/PersonService.js';

class PersonSeeder {
  private readonly service: PersonService;

  constructor(service: PersonService) {
    this.service = service;
  }

  public static generate(): Omit<Person, 'id'> {
    return {
      name: faker.person.fullName().trim(),
      email: faker.internet.email().trim(),
      phoneNumber: faker.phone.number(),
      bio: faker.person.bio().trim(),
      studiesOrJob: faker.person.jobTitle().trim(),
      birthdate: faker.date.between({ from: '1910-01-01', to: '2000-01-01' }),
    };
  }

  private add(): Promise<Person> {
    return this.service.create(PersonSeeder.generate());
  }

  async run(): Promise<Person[]> {
    const promises = Array.from({ length: 10 }).map(() => this.add());
    return Promise.all(promises);
  }
}

export default PersonSeeder;
