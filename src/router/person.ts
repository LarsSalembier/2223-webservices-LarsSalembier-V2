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

    this.getAllPeople = this.getAllPeople.bind(this);
    this.getPeopleCount = this.getPeopleCount.bind(this);
    this.getPersonById = this.getPersonById.bind(this);
    this.createPerson = this.createPerson.bind(this);
    this.updatePerson = this.updatePerson.bind(this);
    this.deletePerson = this.deletePerson.bind(this);
    this.deleteAllPeople = this.deleteAllPeople.bind(this);

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
    const person = await this.personService.getById(ctx.params.id);

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

    await this.personService.update(ctx.params.id, inputData);

    ctx.status = 204;
  }

  async deletePerson(ctx: Context) {
    await this.personService.delete(ctx.params.id);

    ctx.status = 204;
  }

  async deleteAllPeople(ctx: Context) {
    await this.personService.deleteAll();

    ctx.status = 204;
  }
}

export default PersonRouter;
