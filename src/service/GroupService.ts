import { Group, Person } from '@prisma/client';
import ServiceError from '../core/ServiceError.js';
import GroupRepository from '../repository/GroupRepository.js';
import RepositoryError, {
  RepositoryErrorType,
} from '../repository/RepositoryError.js';
import MembershipRepository from '../repository/MembershipRepository.js';
import PersonRepository from '../repository/PersonRepository.js';

class GroupService {
  private readonly groupRepository;

  private readonly membershipRepository;

  private readonly personRepository;

  constructor(
    groupRepository: GroupRepository,
    membershipRepository: MembershipRepository,
    personRepository: PersonRepository
  ) {
    this.groupRepository = groupRepository;
    this.membershipRepository = membershipRepository;
    this.personRepository = personRepository;
  }

  async getAll(): Promise<Group[]> {
    return this.groupRepository.getAll();
  }

  async getById(id: number): Promise<Group> {
    try {
      return await this.groupRepository.getById(id);
    } catch (err) {
      if (err instanceof RepositoryError) {
        if (err.type === RepositoryErrorType.NOT_FOUND) {
          throw ServiceError.notFound(err.message);
        }
      }
      throw err;
    }
  }

  async getMembers(id: number): Promise<Person[]> {
    // check if group exists
    await this.getById(id);

    const memberships = await this.membershipRepository.getByGroupId(id);

    return Promise.all(
      memberships.map(async (membership) => {
        return this.personRepository.getById(membership.personId);
      })
    );
  }

  async create(data: Omit<Group, 'id'>): Promise<Group> {
    return this.groupRepository.create(data);
  }

  async addMember(id: number, personId: number): Promise<void> {
    // check if group exists
    await this.getById(id);

    // check if person exists
    try {
      await this.personRepository.getById(personId);
    } catch (e) {
      if (e instanceof RepositoryError) {
        if (e.type === RepositoryErrorType.NOT_FOUND) {
          throw ServiceError.notFound(e.message);
        }
      }
      throw e;
    }

    try {
      await this.membershipRepository.create({
        groupId: id,
        personId,
      });
    } catch (e) {
      if (e instanceof RepositoryError) {
        if (e.type === RepositoryErrorType.ALREADY_EXISTS) {
          throw ServiceError.conflict(e.message);
        }
      }
      throw e;
    }
  }

  async createMany(data: Omit<Group, 'id'>[]): Promise<Group[]> {
    return this.groupRepository.createMany(data);
  }

  async update(id: number, data: Partial<Omit<Group, 'id'>>): Promise<Group> {
    try {
      return await this.groupRepository.update(id, data);
    } catch (e) {
      if (e instanceof RepositoryError) {
        if (e.type === RepositoryErrorType.NOT_FOUND) {
          throw ServiceError.notFound(e.message);
        }
      }
      throw e;
    }
  }

  async delete(id: number): Promise<Group> {
    // remove all memberships
    await this.membershipRepository.deleteByGroupId(id);

    try {
      return await this.groupRepository.delete(id);
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
    // remove all memberships
    await Promise.all(
      ids.map(async (id) => {
        await this.membershipRepository.deleteByGroupId(id);
      })
    );

    return this.groupRepository.deleteMany(ids);
  }

  async deleteAll(): Promise<number> {
    // remove all memberships
    await this.membershipRepository.deleteAll();

    return this.groupRepository.deleteAll();
  }

  async removeMember(id: number, memberId: number): Promise<void> {
    // check if group exists
    await this.getById(id);

    // check if person exists
    try {
      await this.personRepository.getById(memberId);
    } catch (e) {
      if (e instanceof RepositoryError) {
        if (e.type === RepositoryErrorType.NOT_FOUND) {
          throw ServiceError.notFound(e.message);
        }
      }
      throw e;
    }

    try {
      await this.membershipRepository.delete(memberId, id);
    } catch (e) {
      if (e instanceof RepositoryError) {
        if (e.type === RepositoryErrorType.NOT_FOUND) {
          throw ServiceError.notFound(e.message);
        }
      }
      throw e;
    }
  }

  async removeAllMembers(groupId: number): Promise<void> {
    // check if group exists
    await this.getById(groupId);

    await this.membershipRepository.deleteByGroupId(groupId);
  }
}

export default GroupService;
