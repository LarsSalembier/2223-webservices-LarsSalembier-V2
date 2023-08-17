import Router from '@koa/router';
import { Person } from '@prisma/client';
import { Context } from 'koa';
import PersonService from '../service/person.js';
import Validator from '../validation/validation.js';
import schemas from '../validation/person.js';

const PATH = '/api/people';

class PersonRouter {
  public readonly router: Router;

  private readonly service: PersonService;

  constructor(router: Router, service: PersonService) {
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
    ctx.body = await this.service.create(
      ctx.request.body as Omit<Person, 'id'>
    );
    ctx.status = 201;
  }

  async update(ctx: Context) {
    ctx.body = await this.service.update(
      ctx.params.id,
      ctx.request.body as Partial<Omit<Person, 'id'>>
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

export default PersonRouter;
