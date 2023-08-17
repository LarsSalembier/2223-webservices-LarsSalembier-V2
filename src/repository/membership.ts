import { Membership, Prisma, PrismaClient } from '@prisma/client';
import RepositoryError from './RepositoryError.js';

class MembershipRepository {
  private readonly prisma;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async getByPersonAndGroupId(
    personId: number,
    groupId: number
  ): Promise<Membership> {
    const data = await this.prisma.membership.findUnique({
      where: {
        personId_groupId: {
          personId,
          groupId,
        },
      },
    });

    if (!data) {
      throw RepositoryError.notFound(
        `Person with id ${personId} is not a member of group with id ${groupId}`
      );
    }

    return data;
  }

  async getByPersonId(personId: number): Promise<Membership[]> {
    return this.prisma.membership.findMany({
      where: {
        personId,
      },
    });
  }

  async getByGroupId(groupId: number): Promise<Membership[]> {
    return this.prisma.membership.findMany({
      where: {
        groupId,
      },
    });
  }

  async create(data: Membership): Promise<Membership> {
    try {
      return await this.prisma.membership.create({
        data,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw RepositoryError.alreadyExists(
            `Person with id ${data.personId} is already a member of group with id ${data.groupId}`
          );
        }
        if (e.code === 'P2025') {
          throw RepositoryError.notFound(
            `There is no person with id ${data.personId}, or there is no group with id ${data.groupId}`
          );
        }
      }
      throw e;
    }
  }

  async createMany(data: Membership[]): Promise<Membership[]> {
    const creationPromises = data.map((entity) => this.create(entity));

    return Promise.all(creationPromises);
  }

  async delete(personId: number, groupId: number): Promise<Membership> {
    try {
      return await this.prisma.membership.delete({
        where: {
          personId_groupId: {
            personId,
            groupId,
          },
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError)
        if (e.code === 'P2025') {
          throw RepositoryError.notFound(
            `Person with id ${personId} is not a member of group with id ${groupId}`
          );
        }
      throw e;
    }
  }

  async deleteByPersonId(personId: number): Promise<number> {
    const batchPayload = await this.prisma.membership.deleteMany({
      where: {
        personId,
      },
    });

    return batchPayload.count;
  }

  async deleteByGroupId(groupId: number): Promise<number> {
    const batchPayload = await this.prisma.membership.deleteMany({
      where: {
        groupId,
      },
    });

    return batchPayload.count;
  }

  async deleteAll(): Promise<number> {
    const batchPayload = await this.prisma.membership.deleteMany();

    return batchPayload.count;
  }
}

export default MembershipRepository;
