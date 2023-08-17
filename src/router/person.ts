import Router from '@koa/router';
import { Membership, Person } from '@prisma/client';
import { Context } from 'koa';
import PersonService from '../service/person.js';
import Validator from '../validation/validation.js';
import schemas from '../validation/person.js';
import GroupService from '../service/group.js';
import MembershipService from '../service/membership.js';

const PATH = '/api/people';

class PersonRouter {
  public readonly router: Router;

  private readonly groupService: GroupService;

  private readonly personService: PersonService;

  private readonly membershipService: MembershipService;

  constructor(
    router: Router,
    groupService: GroupService,
    personService: PersonService,
    membershipService: MembershipService
  ) {
    this.router = router;
    this.groupService = groupService;
    this.personService = personService;
    this.membershipService = membershipService;

    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.getGroups = this.getGroups.bind(this);
    this.create = this.create.bind(this);
    this.joinGroup = this.joinGroup.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.deleteAll = this.deleteAll.bind(this);
    this.leaveGroup = this.leaveGroup.bind(this);
    this.leaveAllGroups = this.leaveAllGroups.bind(this);

    router.get(PATH, Validator.validate(schemas.getAll), this.getAll);

    router.get(
      `${PATH}/:id`,
      Validator.validate(schemas.getById),
      this.getById
    );

    router.get(
      `${PATH}/:id/groups`,
      Validator.validate(schemas.getGroups),
      this.getGroups
    );

    router.post(PATH, Validator.validate(schemas.create), this.create);

    router.post(
      `${PATH}/:id/groups`,
      Validator.validate(schemas.joinGroup),
      this.joinGroup
    );

    router.put(`${PATH}/:id`, Validator.validate(schemas.update), this.update);

    router.delete(
      `${PATH}/:id`,
      Validator.validate(schemas.delete),
      this.delete
    );

    router.delete(PATH, Validator.validate(schemas.deleteAll), this.deleteAll);

    router.delete(
      `${PATH}/:id/groups/:groupId`,
      Validator.validate(schemas.leaveGroup),
      this.leaveGroup
    );

    router.delete(
      `${PATH}/:id/groups`,
      Validator.validate(schemas.leaveAllGroups),
      this.leaveAllGroups
    );
  }

  async getAll(ctx: Context) {
    ctx.body = await this.personService.getAll();
  }

  async getById(ctx: Context) {
    ctx.body = await this.personService.getById(ctx.params.id);
  }

  async getGroups(ctx: Context) {
    await this.personService.getById(ctx.params.id);
    const memberships = await this.membershipService.getByPersonId(
      ctx.params.id
    );
    const groupIds = memberships.map((membership) => membership.groupId);
    ctx.body = await Promise.all(
      groupIds.map(async (groupId) => {
        return this.groupService.getById(groupId);
      })
    );
  }

  async create(ctx: Context) {
    ctx.body = await this.personService.create(
      ctx.request.body as Omit<Person, 'id'>
    );
    ctx.status = 201;
  }

  async joinGroup(ctx: Context) {
    const { id } = ctx.params;
    const { groupId } = ctx.request.body as Omit<Membership, 'personId'>;
    await this.membershipService.create({
      groupId,
      personId: id,
    });
    ctx.body = `Person ${id} added to group ${groupId}`;
    ctx.status = 201;
  }

  async update(ctx: Context) {
    ctx.body = await this.personService.update(
      ctx.params.id,
      ctx.request.body as Partial<Omit<Person, 'id'>>
    );
    ctx.status = 200;
  }

  async delete(ctx: Context) {
    await this.membershipService.deleteByPersonId(ctx.params.id);

    await this.personService.delete(ctx.params.id);
    ctx.status = 204;
  }

  async deleteAll(ctx: Context) {
    await this.membershipService.deleteAll();

    await this.personService.deleteAll();
    ctx.status = 204;
  }

  async leaveGroup(ctx: Context) {
    await this.membershipService.delete(ctx.params.id, ctx.params.groupId);
    ctx.status = 204;
  }

  async leaveAllGroups(ctx: Context) {
    await this.membershipService.deleteByPersonId(ctx.params.id);
    ctx.status = 204;
  }
}

export default PersonRouter;
