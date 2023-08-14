import Koa, { Context } from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';

import { PersonData, StringifiedPersonData } from 'typings/Person.js';
import Logger from './Logger.js';
import PersonService from './service/person.js';

const PORT = 9000;

const app = new Koa();

app.use(bodyParser());

const router = new Router();

const getValidatedId = (ctx: Context): number | null => {
  if (!ctx.params.id) {
    ctx.status = 400;
    ctx.body = 'ID is required.';
    return null;
  }
  return parseInt(ctx.params.id, 10);
};

const getValidatedBirthDate = (
  dateString: string | undefined
): Date | undefined | null => {
  if (!dateString) return undefined;

  const birthDate = new Date(dateString);
  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }
  return birthDate;
};

router.get('/api/people', async (ctx) => {
  const people = await PersonService.getAll();
  ctx.body = people;
});

router.get('/api/people/:id', async (ctx) => {
  const id = getValidatedId(ctx);
  if (!id) return;

  const person = await PersonService.getById(id);

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

  const birthDate = getValidatedBirthDate(personData.birthDate);
  if (birthDate === null) {
    ctx.status = 400;
    ctx.body = 'Invalid birth date.';
    return;
  }

  const validatedData: PersonData = {
    ...personData,
    birthDate,
  };

  const newPerson = await PersonService.create(validatedData);

  ctx.status = 201;
  ctx.set('Location', `/api/people/${newPerson.id}`);
});

router.put('/api/people/:id', async (ctx) => {
  const id = getValidatedId(ctx);
  if (!id) return;

  const personData = ctx.request.body as Partial<StringifiedPersonData>;

  const birthDate = getValidatedBirthDate(personData.birthDate);
  if (birthDate === null) {
    ctx.status = 400;
    ctx.body = 'Invalid birth date.';
    return;
  }

  const validatedData: Partial<PersonData> = {
    ...personData,
    birthDate,
  };

  const idExists = await PersonService.update(id, validatedData);

  if (!idExists) {
    ctx.status = 404;
    return;
  }

  ctx.status = 204;
});

router.delete('/api/people/:id', async (ctx) => {
  const id = getValidatedId(ctx);
  if (!id) return;

  const idExists = await PersonService.remove(id);

  if (!idExists) {
    ctx.status = 404;
    return;
  }

  ctx.status = 204;
});

app.use(router.routes()).use(router.allowedMethods());

const logger = Logger.getInstance();
logger.info(`🚀 Server listening on http://localhost:9000`);

app.listen(PORT);
