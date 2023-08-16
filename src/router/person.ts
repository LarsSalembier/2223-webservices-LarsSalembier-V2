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
    const people = await this.service.getAll();

    ctx.body = people;
  }

  async getById(ctx: Context) {
    const person = await this.service.getById(ctx.params.id);

    ctx.body = person;
  }

  async create(ctx: Context) {
    const inputData = ctx.request.body as Omit<Person, 'id'>;

    const createdPerson = await this.service.create(inputData);

    ctx.status = 201;
    ctx.set('Location', `/api/people/${createdPerson.id}`);
  }

  async update(ctx: Context) {
    const inputData = ctx.request.body as Partial<Omit<Person, 'id'>>;

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
}

export default PersonRouter;
