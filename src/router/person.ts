import Router from '@koa/router';
import { Person } from '@prisma/client';
import { Context } from 'koa';
import PersonService from '../service/person.js';
import Validator from '../validation/validation.js';
import schemas from '../validation/person.js';

class PersonRouter {
  public readonly router: Router;

  private readonly personService: PersonService;

  constructor(router: Router, personService: PersonService) {
    this.router = router;
    this.personService = personService;

    router.get(
      '/api/people',
      Validator.validate(schemas.getAllPeople),
      this.getAllPeople
    );

    router.get(
      '/api/people/count',
      Validator.validate(schemas.getPeopleCount),
      this.getPeopleCount
    );

    router.get(
      '/api/people/:id',
      Validator.validate(schemas.getPersonById),
      this.getPersonById
    );

    router.post(
      '/api/people',
      Validator.validate(schemas.createPerson),
      this.createPerson
    );

    router.put(
      '/api/people/:id',
      Validator.validate(schemas.updatePerson),
      this.updatePerson
    );

    router.delete(
      '/api/people/:id',
      Validator.validate(schemas.deletePerson),
      this.deletePerson
    );

    router.delete(
      '/api/people',
      Validator.validate(schemas.deleteAllPeople),
      this.deleteAllPeople
    );
  }

  async getAllPeople(ctx: Context) {
    const people = await this.personService.getAll();
    ctx.body = people;
  }

  async getPeopleCount(ctx: Context) {
    const count = await this.personService.count();
    ctx.body = count;
  }

  async getPersonById(ctx: Context) {
    const person = await this.personService.getById(ctx.context.id);

    if (!person) {
      ctx.status = 404;
      return;
    }

    ctx.body = person;
  }

  async createPerson(ctx: Context) {
    const inputData = ctx.request.body as Omit<Person, 'id'>;

    const createdPerson = await this.personService.create(inputData);

    ctx.status = 201;
    ctx.set('Location', `/api/people/${createdPerson.id}`);
  }

  async updatePerson(ctx: Context) {
    const inputData = ctx.request.body as Partial<Omit<Person, 'id'>>;

    const updatedPerson = await this.personService.update(
      ctx.params.id,
      inputData
    );

    if (!updatedPerson) {
      ctx.status = 404;
      return;
    }

    ctx.status = 204;
  }

  async deletePerson(ctx: Context) {
    const deletedPerson = await this.personService.delete(ctx.params.id);

    if (!deletedPerson) {
      ctx.status = 404;
      return;
    }

    ctx.status = 204;
  }

  async deleteAllPeople(ctx: Context) {
    const count = await this.personService.count();
    const amountDeleted = await this.personService.deleteAll();

    if (amountDeleted !== count) {
      ctx.status = 500;
      ctx.body = 'Some people in the request did not exist.';
      return;
    }

    ctx.status = 204;
  }
}

export default PersonRouter;
