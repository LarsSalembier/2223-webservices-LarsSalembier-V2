import { faker } from '@faker-js/faker';
import { Group } from '@prisma/client';
import GroupService from '../service/group.js';

class GroupSeeder {
  private readonly service: GroupService;

  constructor(service: GroupService) {
    this.service = service;
  }

  public static generate(): Omit<Group, 'id'> {
    return {
      name: faker.lorem.words(3),
      description: faker.lorem.words(10),
      color: faker.color.human(),
      target: faker.lorem.words(3),
    };
  }

  private add(): Promise<Group> {
    return this.service.create(GroupSeeder.generate());
  }

  async run(): Promise<Group[]> {
    await this.service.deleteAll();
    const promises = Array.from({ length: 10 }).map(() => this.add());
    return Promise.all(promises);
  }
}

export default GroupSeeder;
