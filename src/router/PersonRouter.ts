import Router from '@koa/router';
import { Membership, Person } from '@prisma/client';
import { Context } from 'koa';
import PersonService from '../service/PersonService.js';
import Validator from '../validation/Validator.js';
import schemas from '../validation/personSchema.js';
import Auth, { Permission } from '../core/Auth.js';

const PATH = '/api/people';

class PersonRouter {
  public readonly router: Router;

  private readonly personService: PersonService;

  constructor(router: Router, personService: PersonService) {
    this.router = router;
    this.personService = personService;

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
      Auth.hasPermission(Permission.READ_USER),
      Validator.validate(schemas.getById),
      this.getById
    );

    router.get(
      `${PATH}/:id/groups`,
      Auth.hasPermission(Permission.READ_USER),
      Validator.validate(schemas.getGroups),
      this.getGroups
    );

    router.post(
      PATH,
      Auth.hasPermission(Permission.WRITE_ADMIN),
      Validator.validate(schemas.create),
      this.create
    );

    router.post(
      `${PATH}/:id/groups`,
      Auth.hasPermission(Permission.WRITE_ADMIN),
      Validator.validate(schemas.joinGroup),
      this.joinGroup
    );

    router.put(
      `${PATH}/:id`,
      Auth.hasPermission(Permission.WRITE_ADMIN),
      Validator.validate(schemas.update),
      this.update
    );

    router.delete(
      `${PATH}/:id`,
      Auth.hasPermission(Permission.WRITE_ADMIN),
      Validator.validate(schemas.delete),
      this.delete
    );

    router.delete(
      PATH,
      Auth.hasPermission(Permission.WRITE_WEBMASTER),
      Validator.validate(schemas.deleteAll),
      this.deleteAll
    );

    router.delete(
      `${PATH}/:id/groups/:groupId`,
      Auth.hasPermission(Permission.WRITE_ADMIN),
      Validator.validate(schemas.leaveGroup),
      this.leaveGroup
    );

    router.delete(
      `${PATH}/:id/groups`,
      Auth.hasPermission(Permission.WRITE_ADMIN),
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
    ctx.body = await this.personService.getGroups(ctx.params.id);
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

    await this.personService.joinGroup(id, groupId);

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
    await this.personService.delete(ctx.params.id);
    ctx.status = 204;
  }

  async deleteAll(ctx: Context) {
    await this.personService.deleteAll();
    ctx.status = 204;
  }

  async leaveGroup(ctx: Context) {
    await this.personService.leaveGroup(ctx.params.id, ctx.params.groupId);
    ctx.status = 204;
  }

  async leaveAllGroups(ctx: Context) {
    await this.personService.leaveAllGroups(ctx.params.id);
    ctx.status = 204;
  }
}

export default PersonRouter;
