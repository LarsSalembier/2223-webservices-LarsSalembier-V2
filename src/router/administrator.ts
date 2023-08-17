import Router from '@koa/router';
import { Administrator } from '@prisma/client';
import { Context } from 'koa';
import Validator from '../validation/validation.js';
import schemas from '../validation/administrator.js';
import AdministratorService from '../service/administrator.js';

const PATH = '/api/administrators';

class AdministratorRouter {
  public readonly router: Router;

  private readonly service: AdministratorService;

  constructor(router: Router, service: AdministratorService) {
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
      `${PATH}/:auth0id`,
      Validator.validate(schemas.getById),
      this.getById
    );

    router.post(PATH, Validator.validate(schemas.create), this.create);

    router.put(
      `${PATH}/:auth0id`,
      Validator.validate(schemas.update),
      this.update
    );

    router.delete(
      `${PATH}/:auth0id`,
      Validator.validate(schemas.delete),
      this.delete
    );

    router.delete(PATH, Validator.validate(schemas.deleteAll), this.deleteAll);
  }

  async getAll(ctx: Context) {
    ctx.body = await this.service.getAll();
  }

  async getById(ctx: Context) {
    ctx.body = await this.service.getById(ctx.params.auth0id);
  }

  async create(ctx: Context) {
    ctx.body = await this.service.create(ctx.request.body as Administrator);
    ctx.status = 201;
  }

  async update(ctx: Context) {
    ctx.body = await this.service.update(
      ctx.params.auth0id,
      ctx.request.body as Partial<Omit<Administrator, 'auth0id'>>
    );
    ctx.status = 200;
  }

  async delete(ctx: Context) {
    await this.service.delete(ctx.params.auth0id);
    ctx.status = 204;
  }

  async deleteAll(ctx: Context) {
    await this.service.deleteAll();
    ctx.status = 204;
  }
}

export default AdministratorRouter;
