import { PEOPLE } from 'data/mock_data.js';
import { Person, PersonData } from 'typings/Person.js';

class PersonService {
  public static async getAll(): Promise<Person[]> {
    return PEOPLE;
  }

  public static async getById(id: number): Promise<Person | null> {
    const person = PEOPLE.find((p) => p.id === id);
    return person || null;
  }

  public static async create(personData: PersonData): Promise<Person> {
    const uniqueId = Math.random() * 1000000000;

    const person: Person = {
      id: uniqueId,
      ...personData,
    };

    PEOPLE.push(person);

    return person;
  }

  public static async update(
    id: number,
    newData: Partial<PersonData>
  ): Promise<boolean> {
    const person = PEOPLE.find((p) => p.id === id);

    if (!person) {
      return false;
    }

    if (newData.name !== undefined) {
      person.name = newData.name;
    }

    if (newData.email !== undefined) {
      person.email = newData.email;
    }

    if (newData.bio !== undefined) {
      person.bio = newData.bio;
    }

    if (newData.studiesOrJobs !== undefined) {
      person.studiesOrJobs = newData.studiesOrJobs;
    }

    if (newData.birthDate !== undefined) {
      person.birthDate = newData.birthDate;
    }

    if (newData.phoneNumber !== undefined) {
      person.phoneNumber = newData.phoneNumber;
    }

    return true;
  }

  public static async remove(id: number): Promise<boolean> {
    const index = PEOPLE.findIndex((p) => p.id === id);

    if (index === -1) {
      return false;
    }

    PEOPLE.splice(index, 1);

    return true;
  }
}

export default PersonService;
