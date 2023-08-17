import { Membership } from '@prisma/client';
import MembershipService from '../service/membership.js';

class MembershipSeeder {
  private readonly service: MembershipService;

  constructor(service: MembershipService) {
    this.service = service;
  }

  public static generate(personId: number, groupId: number): Membership {
    return {
      personId,
      groupId,
    };
  }

  private add(personId: number, groupId: number): Promise<Membership> {
    return this.service.create(MembershipSeeder.generate(personId, groupId));
  }

  async run(personIds: number[], groupIds: number[]): Promise<Membership[]> {
    await this.service.deleteAll();
    const promises = Array.from({ length: 10 }).map(() => {
      const personId = personIds[
        Math.floor(Math.random() * personIds.length)
      ] as number;
      const groupId = groupIds[
        Math.floor(Math.random() * groupIds.length)
      ] as number;
      return this.add(personId, groupId);
    });
    return Promise.all(promises);
  }
}

export default MembershipSeeder;
