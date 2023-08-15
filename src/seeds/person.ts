import { faker } from '@faker-js/faker';
import { Person } from '@prisma/client';
import PersonRepository from 'repository/person.js';

class PersonSeed {
  private readonly personRepository: PersonRepository;

  constructor(personRepository: PersonRepository) {
    this.personRepository = personRepository;
  }

  private static generatePerson(): Omit<Person, 'id'> {
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
    return this.personRepository.create(PersonSeed.generatePerson());
  }

  async run(): Promise<void> {
    await this.personRepository.deleteAll();
    const promises = Array.from({ length: 10 }).map(() => this.addPerson());
    await Promise.all(promises);
  }
}

export default PersonSeed;
