import { faker } from '@faker-js/faker';
import { Person } from '@prisma/client';
import PersonService from '../service/person.js';

class PersonSeeder {
  private readonly personService: PersonService;

  constructor(personService: PersonService) {
    this.personService = personService;
  }

  public static generatePerson(): Omit<Person, 'id'> {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phoneNumber: faker.phone.number(),
      bio: faker.lorem.paragraph(),
      studiesOrJob: faker.person.jobTitle(),
      birthdate: faker.date.past(),
    };
  }

  private addPerson(): Promise<Person> {
    return this.personService.create(PersonSeeder.generatePerson());
  }

  async run(): Promise<void> {
    await this.personService.deleteAll();
    const promises = Array.from({ length: 10 }).map(() => this.addPerson());
    await Promise.all(promises);
  }
}

export default PersonSeeder;
