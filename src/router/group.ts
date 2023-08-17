import Router from '@koa/router';
import { Group, Membership } from '@prisma/client';
import { Context } from 'koa';
import Validator from '../validation/validation.js';
import schemas from '../validation/group.js';
import GroupService from '../service/group.js';
import MembershipService from '../service/membership.js';
import PersonService from '../service/person.js';

const PATH = '/api/groups';

class GroupRouter {
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
    this.getMembers = this.getMembers.bind(this);
    this.create = this.create.bind(this);
    this.addMember = this.addMember.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.deleteAll = this.deleteAll.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.removeAllMembers = this.removeAllMembers.bind(this);

    router.get(PATH, Validator.validate(schemas.getAll), this.getAll);

    router.get(
      `${PATH}/:id`,
      Validator.validate(schemas.getById),
      this.getById
    );

    router.get(
      `${PATH}/:id/members`,
      Validator.validate(schemas.getMembers),
      this.getMembers
    );

    router.post(PATH, Validator.validate(schemas.create), this.create);

    router.post(
      `${PATH}/:id/members`,
      Validator.validate(schemas.addMember),
      this.addMember
    );

    router.put(`${PATH}/:id`, Validator.validate(schemas.update), this.update);

    router.delete(
      `${PATH}/:id`,
      Validator.validate(schemas.delete),
      this.delete
    );

    router.delete(PATH, Validator.validate(schemas.deleteAll), this.deleteAll);

    router.delete(
      `${PATH}/:id/members/:memberId`,
      Validator.validate(schemas.removeMember),
      this.removeMember
    );

    router.delete(
      `${PATH}/:id/members`,
      Validator.validate(schemas.removeAllMembers),
      this.removeAllMembers
    );
  }

  async getAll(ctx: Context) {
    ctx.body = await this.groupService.getAll();
  }

  async getById(ctx: Context) {
    ctx.body = await this.groupService.getById(ctx.params.id);
  }

  async getMembers(ctx: Context) {
    await this.groupService.getById(ctx.params.id);
    const memberships = await this.membershipService.getByGroupId(
      ctx.params.id
    );
    ctx.body = await Promise.all(
      memberships.map(async (membership) => {
        return this.personService.getById(membership.personId);
      })
    );
  }

  async create(ctx: Context) {
    ctx.body = await this.groupService.create(
      ctx.request.body as Omit<Group, 'id'>
    );
    ctx.status = 201;
  }

  async addMember(ctx: Context) {
    const { id } = ctx.params;
    const { personId } = ctx.request.body as Omit<Membership, 'groupId'>;
    await this.membershipService.create({
      groupId: id,
      personId,
    });
    ctx.body = `Person ${personId} added to group ${id}`;
    ctx.status = 201;
  }

  async update(ctx: Context) {
    ctx.body = await this.groupService.update(
      ctx.params.id,
      ctx.request.body as Partial<Omit<Group, 'id'>>
    );
    ctx.status = 200;
  }

  async delete(ctx: Context) {
    await this.membershipService.deleteByGroupId(ctx.params.id);

    await this.groupService.delete(ctx.params.id);
    ctx.status = 204;
  }

  async deleteAll(ctx: Context) {
    await this.membershipService.deleteAll();

    await this.groupService.deleteAll();
    ctx.status = 204;
  }

  async removeMember(ctx: Context) {
    await this.membershipService.delete(ctx.params.memberId, ctx.params.id);
    ctx.status = 204;
  }

  async removeAllMembers(ctx: Context) {
    await this.membershipService.deleteByGroupId(ctx.params.id);
    ctx.status = 204;
  }
}

export default GroupRouter;
