import { Person } from '@prisma/client';
import PersonRepository from '../repository/person.js';

class PersonService {
  private readonly repository: PersonRepository;

  constructor(repository: PersonRepository) {
    this.repository = repository;
  }

  public async getAll(): Promise<Person[]> {
    return this.repository.getAll();
  }

  public async getById(id: number): Promise<Person | null> {
    return this.repository.getById(id);
  }

  public async create(personData: Omit<Person, 'id'>): Promise<Person> {
    return this.repository.create(personData);
  }

  public async update(
    id: number,
    newData: Partial<Omit<Person, 'id'>>
  ): Promise<Person | null> {
    return this.repository.update(id, newData);
  }

  public async delete(id: number): Promise<boolean> {
    return this.repository.delete(id);
  }
}

export default PersonService;
