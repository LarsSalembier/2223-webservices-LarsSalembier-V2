import { Membership } from '@prisma/client';
import MembershipService from '../service/membership.js';

function shuffle<T>(array: T[]): T[] {
  const shuffled = array.reduce(
    (acc: T[], _, index) => {
      const j = Math.floor(Math.random() * (index + 1));
      const temp: T = acc[index] as T;
      acc[index] = acc[j] as T;
      acc[j] = temp;
      return acc;
    },
    [...array]
  );

  return shuffled;
}

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
    const shuffledPersonIds = shuffle(personIds);
    const shuffledGroupIds = shuffle(groupIds);

    const maxLength = Math.max(
      shuffledPersonIds.length,
      shuffledGroupIds.length
    );

    const pairs: { personId: number; groupId: number }[] = Array.from({
      length: 10,
    }).map((_, i) => {
      return {
        personId: shuffledPersonIds[i % maxLength] as number,
        groupId: shuffledGroupIds[i % maxLength] as number,
      };
    });

    // Ensure uniqueness by creating a Set and then spreading it back into an array
    const uniquePairs = [
      ...new Set(pairs.map((pair) => JSON.stringify(pair))),
    ].map((item) => JSON.parse(item));

    const promises = uniquePairs.map((pair) =>
      this.add(pair.personId, pair.groupId)
    );

    return Promise.all(promises);
  }
}

export default MembershipSeeder;
