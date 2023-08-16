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
    this.count = this.count.bind(this);
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

    router.get(`${PATH}/count`, Validator.validate(schemas.count), this.count);
  }

  async getAll(ctx: Context) {
    const administrators = await this.service.getAll();
    ctx.body = administrators;
  }

  async getById(ctx: Context) {
    const administrator = await this.service.getById(ctx.params.id);

    ctx.body = administrator;
  }

  async create(ctx: Context) {
    const inputData = ctx.request.body as Administrator;

    const createdPerson = await this.service.create(inputData);

    ctx.status = 201;
    ctx.set('Location', `/api/administrator/${createdPerson.auth0id}`);
  }

  async update(ctx: Context) {
    const inputData = ctx.request.body as Partial<
      Omit<Administrator, 'auth0id'>
    >;

    await this.service.update(ctx.params.id, inputData);

    ctx.status = 204;
  }

  async delete(ctx: Context) {
    await this.service.delete(ctx.params.id);

    ctx.status = 204;
  }

  async deleteAll(ctx: Context) {
    await this.service.deleteAll();

    ctx.status = 204;
  }

  async count(ctx: Context) {
    const count = await this.service.count();
    ctx.body = count;
  }
}

export default AdministratorRouter;
