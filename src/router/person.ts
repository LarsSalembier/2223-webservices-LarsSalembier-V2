import Router from '@koa/router';
import { Person } from '@prisma/client';
import { Context } from 'koa';
import { StringifiedPersonData } from 'typings/Person.js';
import PersonService from '../service/person.js';

function getValidatedId(ctx: Context): number | null {
  if (!ctx.params.id) {
    ctx.status = 400;
    ctx.body = 'ID is required.';
    return null;
  }
  return parseInt(ctx.params.id, 10);
}

function getValidatedBirthDate(
  dateString: string | undefined
): Date | undefined | null {
  if (!dateString) return undefined;

  const birthDate = new Date(dateString);
  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }
  return birthDate;
}

function fromStringifiedToPerson(
  stringified: StringifiedPersonData
): Omit<Person, 'id'> {
  // validate birthdate

  const birthdate = getValidatedBirthDate(stringified.birthdate);

  // now we have to check for undefined values and convert them to null
  const personData: Omit<Person, 'id'> = {
    name: stringified.name,
    email: stringified.email ?? null,
    phoneNumber: stringified.phoneNumber ?? null,
    bio: stringified.bio ?? null,
    studiesOrJob: stringified.studiesOrJob ?? null,
    birthdate: birthdate ?? null,
  };

  return personData;
}

class PersonRouter {
  private readonly router: Router;

  private readonly personService: PersonService;

  constructor(router: Router, personService: PersonService) {
    this.router = router;
    this.personService = personService;

    router.get('/api/people', async (ctx) => {
      const people = await personService.getAll();
      ctx.body = people;
    });

    router.get('/api/people/:id', async (ctx) => {
      const id = getValidatedId(ctx);
      if (!id) return;

      const person = await personService.getById(id);

      if (!person) {
        ctx.status = 404;
        return;
      }

      ctx.body = person;
    });

    router.post('/api/people', async (ctx) => {
      const personData = ctx.request.body as StringifiedPersonData;

      if (!personData.name) {
        ctx.status = 400;
        ctx.body = 'Name is required.';
        return;
      }

      const birthdate = getValidatedBirthDate(personData.birthdate);
      if (birthdate === null) {
        ctx.status = 400;
        ctx.body = 'Invalid birth date.';
        return;
      }

      const validatedData = fromStringifiedToPerson(personData);

      const newPerson = await personService.create(validatedData);

      ctx.status = 201;
      ctx.set('Location', `/api/people/${newPerson.id}`);
    });

    router.put('/api/people/:id', async (ctx) => {
      const id = getValidatedId(ctx);
      if (!id) return;

      const personData = ctx.request.body as Partial<StringifiedPersonData>;

      const birthdate = getValidatedBirthDate(personData.birthdate);
      if (birthdate === null) {
        ctx.status = 400;
        ctx.body = 'Invalid birth date.';
        return;
      }

      const validatedData: Partial<Omit<Person, 'id'>> = {
        ...personData,
        birthdate,
      };

      const updatedPerson = await personService.update(id, validatedData);

      if (!updatedPerson) {
        ctx.status = 404;
        return;
      }

      ctx.status = 204;
    });

    router.delete('/api/people/:id', async (ctx) => {
      const id = getValidatedId(ctx);
      if (!id) return;

      const idExists = await personService.delete(id);

      if (!idExists) {
        ctx.status = 404;
        return;
      }

      ctx.status = 204;
    });
  }
}

export default PersonRouter;
