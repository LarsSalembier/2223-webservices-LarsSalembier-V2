import { Group, Person } from '@prisma/client';
import ServiceError from './ServiceError.js';
import PersonRepository from '../repository/PersonRepository.js';
import RepositoryError, {
  RepositoryErrorType,
} from '../repository/RepositoryError.js';
import MembershipRepository from '../repository/MembershipRepository.js';
import GroupRepository from '../repository/GroupRepository.js';

class PersonService {
  private readonly personRepository;

  private readonly membershipRepository;

  private readonly groupRepository;

  constructor(
    personRepository: PersonRepository,
    membershipRepository: MembershipRepository,
    groupRepository: GroupRepository
  ) {
    this.personRepository = personRepository;
    this.membershipRepository = membershipRepository;
    this.groupRepository = groupRepository;
  }

  async getAll(): Promise<Person[]> {
    return this.personRepository.getAll();
  }

  async getById(id: number): Promise<Person> {
    try {
      return await this.personRepository.getById(id);
    } catch (e) {
      if (e instanceof RepositoryError) {
        if (e.type === RepositoryErrorType.NOT_FOUND) {
          throw ServiceError.notFound(e.message);
        }
      }
      throw e;
    }
  }

  async getGroups(id: number): Promise<Group[]> {
    // check if person exists
    await this.getById(id);

    const memberships = await this.membershipRepository.getByPersonId(id);

    const groupIds = memberships.map((membership) => membership.groupId);

    return Promise.all(
      groupIds.map(async (groupId) => {
        return this.groupRepository.getById(groupId);
      })
    );
  }

  async create(data: Omit<Person, 'id'>): Promise<Person> {
    return this.personRepository.create(data);
  }

  async createMany(data: Omit<Person, 'id'>[]): Promise<Person[]> {
    return this.personRepository.createMany(data);
  }

  async joinGroup(id: number, groupId: number): Promise<void> {
    // check if person exists
    await this.getById(id);

    // check if the group exists
    try {
      await this.groupRepository.getById(groupId);
    } catch (e) {
      if (e instanceof RepositoryError) {
        if (e.type === RepositoryErrorType.NOT_FOUND) {
          throw ServiceError.notFound(e.message);
        }
      }
      throw e;
    }

    await this.membershipRepository.create({
      personId: id,
      groupId,
    });
  }

  async update(id: number, data: Partial<Omit<Person, 'id'>>): Promise<Person> {
    try {
      return await this.personRepository.update(id, data);
    } catch (e) {
      if (e instanceof RepositoryError) {
        if (e.type === RepositoryErrorType.NOT_FOUND) {
          throw ServiceError.notFound(e.message);
        }
      }
      throw e;
    }
  }

  async delete(id: number): Promise<Person> {
    // delete all memberships
    await this.membershipRepository.deleteByPersonId(id);

    try {
      return await this.personRepository.delete(id);
    } catch (e) {
      if (e instanceof RepositoryError) {
        if (e.type === RepositoryErrorType.NOT_FOUND) {
          throw ServiceError.notFound(e.message);
        }
      }
      throw e;
    }
  }

  async deleteMany(ids: number[]): Promise<number> {
    // delete all memberships
    await Promise.all(
      ids.map(async (id) => {
        await this.membershipRepository.deleteByPersonId(id);
      })
    );

    return this.personRepository.deleteMany(ids);
  }

  async deleteAll(): Promise<number> {
    // delete all memberships
    await this.membershipRepository.deleteAll();

    return this.personRepository.deleteAll();
  }

  async leaveGroup(id: number, groupId: number): Promise<void> {
    // check if person exists
    await this.getById(id);

    // check if the group exists
    try {
      await this.groupRepository.getById(groupId);
    } catch (e) {
      if (e instanceof RepositoryError) {
        if (e.type === RepositoryErrorType.NOT_FOUND) {
          throw ServiceError.notFound(e.message);
        }
      }
      throw e;
    }

    try {
      await this.membershipRepository.delete(id, groupId);
    } catch (e) {
      if (e instanceof RepositoryError) {
        if (e.type === RepositoryErrorType.NOT_FOUND) {
          throw ServiceError.notFound(e.message);
        }
      }
      throw e;
    }
  }

  async leaveAllGroups(id: number): Promise<void> {
    // check if person exists
    await this.getById(id);

    await this.membershipRepository.deleteByPersonId(id);
  }
}

export default PersonService;
