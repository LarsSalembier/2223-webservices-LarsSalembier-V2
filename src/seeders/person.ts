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
      name: faker.person.fullName().trim(),
      email: faker.internet.email().trim(),
      phoneNumber: faker.phone.number(),
      bio: faker.person.bio().trim(),
      studiesOrJob: faker.person.jobTitle().trim(),
      birthdate: faker.date.between({ from: '1910-01-01', to: '2000-01-01' }),
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
