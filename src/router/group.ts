import Router from '@koa/router';
import { Group } from '@prisma/client';
import { Context } from 'koa';
import Validator from '../validation/validation.js';
import schemas from '../validation/group.js';
import GroupService from '../service/group.js';

const PATH = '/api/groups';

class GroupRouter {
  public readonly router: Router;

  private readonly service: GroupService;

  constructor(router: Router, service: GroupService) {
    this.router = router;
    this.service = service;

    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.deleteAll = this.deleteAll.bind(this);

    router.get(PATH, Validator.validate(schemas.getAll), this.getAll);

    router.get(
      `${PATH}/:id`,
      Validator.validate(schemas.getById),
      this.getById
    );

    router.post(PATH, Validator.validate(schemas.create), this.create);

    router.put(`${PATH}/:id`, Validator.validate(schemas.update), this.update);

    router.delete(
      `${PATH}/:id`,
      Validator.validate(schemas.delete),
      this.delete
    );

    router.delete(PATH, Validator.validate(schemas.deleteAll), this.deleteAll);
  }

  async getAll(ctx: Context) {
    ctx.body = await this.service.getAll();
  }

  async getById(ctx: Context) {
    ctx.body = await this.service.getById(ctx.params.id);
  }

  async create(ctx: Context) {
    ctx.body = await this.service.create(ctx.request.body as Omit<Group, 'id'>);
    ctx.status = 201;
  }

  async update(ctx: Context) {
    ctx.body = await this.service.update(
      ctx.params.id,
      ctx.request.body as Partial<Omit<Group, 'id'>>
    );
    ctx.status = 200;
  }

  async delete(ctx: Context) {
    await this.service.delete(ctx.params.id);
    ctx.status = 204;
  }

  async deleteAll(ctx: Context) {
    await this.service.deleteAll();
    ctx.status = 204;
  }
}

export default GroupRouter;
