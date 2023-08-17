/* eslint-disable import/no-extraneous-dependencies */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import { Person } from '@prisma/client';
import Server from '../../core/Server.js';
import PersonSeeder from '../../seeders/person.js';

type IncomingPersonData = {
  name: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  studiesOrJob?: string;
  birthdate?: string;
};

const AMOUNT_OF_PEOPLE = 5;

export const PEOPLE_PATH = '/api/people';

const server = new Server(9000);

const sortPeople = (a: Omit<Person, 'id'>, b: Omit<Person, 'id'>) => {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
};

const sortPeopleWithId = (a: Person, b: Person) => {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
};

export const PEOPLE: Omit<Person, 'id'>[] = Array.from({
  length: AMOUNT_OF_PEOPLE,
})
  .map(() => PersonSeeder.generate())
  .sort(sortPeople);

async function addAllPeople(request: supertest.SuperTest<supertest.Test>) {
  await Promise.all(
    PEOPLE.map((person) => {
      return request.post(PEOPLE_PATH).send(person);
    })
  );
}

export function incomingToReal(person: IncomingPersonData): Omit<Person, 'id'> {
  return {
    name: person.name,
    email: person.email ?? null,
    phoneNumber: person.phoneNumber ?? null,
    bio: person.bio ?? null,
    studiesOrJob: person.studiesOrJob ?? null,
    birthdate: person.birthdate ? new Date(person.birthdate) : null,
  };
}

describe('people', () => {
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    await server.start();
    request = supertest(server.app.callback());
  });

  afterAll(async () => {
    await server.stop();
    await request.delete(PEOPLE_PATH);
  });

  beforeEach(async () => {
    await request.delete(PEOPLE_PATH);
  });

  describe(`GET ${PEOPLE_PATH}`, () => {
    it('should return 200', async () => {
      const response = await request.get(PEOPLE_PATH);
      expect(response.status).toBe(200);
    });

    it('should return an array of people', async () => {
      const response = await request.get(PEOPLE_PATH);
      expect(response.body).toBeInstanceOf(Array);
    });

    it('should return the correct amount of people', async () => {
      await addAllPeople(request);
      const response = await request.get(PEOPLE_PATH);
      expect(response.body.length).toBe(PEOPLE.length);
    });

    it('should return the correct people', async () => {
      await addAllPeople(request);
      const response = await request.get(PEOPLE_PATH);
      const sortedResponse = response.body.sort(sortPeopleWithId);

      expect(sortedResponse.map(incomingToReal)).toEqual(PEOPLE);
    });
  });

  describe(`GET ${PEOPLE_PATH}/:id`, () => {
    it('should return 200', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const response = await request.get(
        `${PEOPLE_PATH}/${postResponse.body.id}`
      );

      expect(response.status).toBe(200);
    });

    it('should return the correct person', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const response = await request.get(
        `${PEOPLE_PATH}/${postResponse.body.id}`
      );

      expect(incomingToReal(response.body)).toEqual(PEOPLE[0]);
    });

    it('should return 404 if the person does not exist', async () => {
      const response = await request.get(`${PEOPLE_PATH}/1`);

      expect(response.status).toBe(404);
    });

    it('should return 400 if the id is not a number', async () => {
      const response = await request.get(`${PEOPLE_PATH}/abc`);

      expect(response.status).toBe(400);
    });

    it('should return 400 if the id is not an integer', async () => {
      const response = await request.get(`${PEOPLE_PATH}/1.5`);

      expect(response.status).toBe(400);
    });

    it('should return 400 if the id is negative', async () => {
      const response = await request.get(`${PEOPLE_PATH}/-1`);

      expect(response.status).toBe(400);
    });

    it('should return 400 if the id is zero', async () => {
      const response = await request.get(`${PEOPLE_PATH}/0`);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/people', () => {
    it('should return 201', async () => {
      const response = await request.post(PEOPLE_PATH).send(PEOPLE[0]);
      expect(response.status).toBe(201);
    });

    it('should actually create the person', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const getResponse = await request.get(
        `${PEOPLE_PATH}/${postResponse.body.id}`
      );
      expect(incomingToReal(getResponse.body)).toEqual(PEOPLE[0]);
    });

    it('should return the created person', async () => {
      const response = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      expect(incomingToReal(response.body)).toEqual(PEOPLE[0]);
    });

    it('should return 400 if the name is missing', async () => {
      const response = await request.post(PEOPLE_PATH).send({});
      expect(response.status).toBe(400);
    });

    it('should return 400 if the name is more than 100 characters long', async () => {
      const response = await request.post(PEOPLE_PATH).send({
        name: 'a'.repeat(101),
      });
      expect(response.status).toBe(400);
    });

    it('should return 400 if the name is less than 3 characters long', async () => {
      const response = await request.post(PEOPLE_PATH).send({
        name: 'aa',
      });
      expect(response.status).toBe(400);
    });

    it('should trim the name', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send({
        name: '   abc   ',
      });

      expect(postResponse.body.name).toBe('abc');
    });

    it('should return 400 if the email is not an email', async () => {
      const response = await request.post(PEOPLE_PATH).send({
        name: 'a'.repeat(3),
        email: 'not an email',
      });
      expect(response.status).toBe(400);
    });

    it('should return 400 if the email is more than 100 characters long', async () => {
      const response = await request.post(PEOPLE_PATH).send({
        name: 'a'.repeat(3),
        email: `${'a'.repeat(50)}.${'a'.repeat(50)}@gmail.com`,
      });
      expect(response.status).toBe(400);
    });

    it('should trim the email', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send({
        name: 'a'.repeat(3),
        email: '    a.b@gmail.com   ',
      });

      expect(postResponse.body.email).toBe('a.b@gmail.com');
    });

    it('should trim the phoneNumber', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send({
        name: 'a'.repeat(3),
        phoneNumber: '   123456789   ',
      });

      expect(postResponse.body.phoneNumber).toBe('123456789');
    });

    it('should return 400 if the phoneNumber is more than 30 characters long', async () => {
      const response = await request.post(PEOPLE_PATH).send({
        name: 'a'.repeat(3),
        phoneNumber: 'a'.repeat(31),
      });
      expect(response.status).toBe(400);
    });

    it('should trim the bio', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send({
        name: 'a'.repeat(3),
        bio: '   abc   ',
      });

      expect(postResponse.body.bio).toBe('abc');
    });

    it('should return 400 if the bio is more than 500 characters long', async () => {
      const response = await request.post(PEOPLE_PATH).send({
        name: 'a'.repeat(3),
        bio: 'a'.repeat(501),
      });
      expect(response.status).toBe(400);
    });

    it('should trim studiesOrJob', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send({
        name: 'a'.repeat(3),
        studiesOrJob: '   abc   ',
      });

      expect(postResponse.body.studiesOrJob).toBe('abc');
    });

    it('should return 400 if studiesOrJob is more than 100 characters long', async () => {
      const response = await request.post(PEOPLE_PATH).send({
        name: 'a'.repeat(3),
        studiesOrJob: 'a'.repeat(101),
      });
      expect(response.status).toBe(400);
    });

    it('should return 400 if the birthdate is not a date', async () => {
      const response = await request.post(PEOPLE_PATH).send({
        name: 'a'.repeat(3),
        birthdate: 'not a date',
      });
      expect(response.status).toBe(400);
    });

    it('should return 400 if the birthdate is in the future', async () => {
      const response = await request.post(PEOPLE_PATH).send({
        name: 'a'.repeat(3),
        birthdate: '2100-01-01',
      });
      expect(response.status).toBe(400);
    });

    it('should return 400 if the birthdate is before 1900', async () => {
      const response = await request.post(PEOPLE_PATH).send({
        name: 'a'.repeat(3),
        birthdate: '1899-12-31',
      });
      expect(response.status).toBe(400);
    });
  });

  describe(`PUT ${PEOPLE_PATH}/:id`, () => {
    it('should return 200', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const response = await request
        .put(`${PEOPLE_PATH}/${postResponse.body.id}`)
        .send({ name: 'new name' });
      expect(response.status).toBe(200);
    });

    it('should actually update the person', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const putResponse = await request
        .put(`${PEOPLE_PATH}/${postResponse.body.id}`)
        .send(PEOPLE[1]);

      expect(incomingToReal(putResponse.body)).toEqual(PEOPLE[1]);
    });

    it('should return the updated person', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const putResponse = await request
        .put(`${PEOPLE_PATH}/${postResponse.body.id}`)
        .send(PEOPLE[1]);

      expect(incomingToReal(putResponse.body)).toEqual(PEOPLE[1]);
    });

    it('should return 404 if the person does not exist', async () => {
      const response = await request
        .put(`${PEOPLE_PATH}/1`)
        .send({ name: 'new name' });
      expect(response.status).toBe(404);
    });

    it('should return 400 if the name is less than 3 characters long', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const response = await request
        .put(`${PEOPLE_PATH}/${postResponse.body.id}`)
        .send({ name: 'aa' });
      expect(response.status).toBe(400);
    });

    it('should return 400 if the name is more than 100 characters long', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const response = await request
        .put(`${PEOPLE_PATH}/${postResponse.body.id}`)
        .send({ name: 'a'.repeat(101) });
      expect(response.status).toBe(400);
    });

    it('should trim the name', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const response = await request
        .put(`${PEOPLE_PATH}/${postResponse.body.id}`)
        .send({
          name: '   abc   ',
        });

      expect(response.body.name).toBe('abc');
    });

    it('should return 400 if the email is not an email', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const response = await request
        .put(`${PEOPLE_PATH}/${postResponse.body.id}`)
        .send({ email: 'not an email' });
      expect(response.status).toBe(400);
    });

    it('should return 400 if the email is more than 100 characters long', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const response = await request
        .put(`${PEOPLE_PATH}/${postResponse.body.id}`)
        .send({ email: `${'a'.repeat(50)}.${'a'.repeat(50)}@gmail.com` });
      expect(response.status).toBe(400);
    });

    it('should trim the email', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const response = await request
        .put(`${PEOPLE_PATH}/${postResponse.body.id}`)
        .send({
          email: '     a.b@gmail.com     ',
        });

      expect(response.body.email).toBe('a.b@gmail.com');
    });

    it('should return 400 if the phoneNumber is more than 30 characters long', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const response = await request
        .put(`${PEOPLE_PATH}/${postResponse.body.id}`)
        .send({ phoneNumber: 'a'.repeat(31) });
      expect(response.status).toBe(400);
    });

    it('should trim the phoneNumber', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const response = await request
        .put(`${PEOPLE_PATH}/${postResponse.body.id}`)
        .send({
          phoneNumber: '   123456789   ',
        });

      expect(response.body.phoneNumber).toBe('123456789');
    });

    it('should return 400 if the bio is more than 500 characters long', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const response = await request
        .put(`${PEOPLE_PATH}/${postResponse.body.id}`)
        .send({ bio: 'a'.repeat(501) });
      expect(response.status).toBe(400);
    });

    it('should trim the bio', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const response = await request
        .put(`${PEOPLE_PATH}/${postResponse.body.id}`)
        .send({
          bio: '   abc   ',
        });

      expect(response.body.bio).toBe('abc');
    });

    it('should return 400 if the studiesOrJob is more than 100 characters long', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const response = await request
        .put(`${PEOPLE_PATH}/${postResponse.body.id}`)
        .send({ studiesOrJob: 'a'.repeat(101) });
      expect(response.status).toBe(400);
    });

    it('should trim the studiesOrJob', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const response = await request
        .put(`${PEOPLE_PATH}/${postResponse.body.id}`)
        .send({
          studiesOrJob: '   abc   ',
        });

      expect(response.body.studiesOrJob).toBe('abc');
    });

    it('should return 400 if the birthdate is not a date', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const response = await request
        .put(`${PEOPLE_PATH}/${postResponse.body.id}`)
        .send({ birthdate: 'not a date' });
      expect(response.status).toBe(400);
    });

    it('should return 400 if the birthdate is in the future', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const response = await request
        .put(`${PEOPLE_PATH}/${postResponse.body.id}`)
        .send({ birthdate: '2100-01-01' });
      expect(response.status).toBe(400);
    });

    it('should return 400 if the birthdate is before 1900-01-01', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const response = await request
        .put(`${PEOPLE_PATH}/${postResponse.body.id}`)
        .send({ birthdate: '1899-12-31' });
      expect(response.status).toBe(400);
    });

    it('should return 400 if the id is not a number', async () => {
      const response = await request.put(`${PEOPLE_PATH}/abc`).send(PEOPLE[0]);
      expect(response.status).toBe(400);
    });

    it('should return 400 if the id is not an integer', async () => {
      const response = await request.put(`${PEOPLE_PATH}/1.5`).send(PEOPLE[0]);
      expect(response.status).toBe(400);
    });

    it('should return 400 if the id is less than 1', async () => {
      const response = await request.put(`${PEOPLE_PATH}/0`).send(PEOPLE[0]);
      expect(response.status).toBe(400);
    });
  });

  describe(`DELETE ${PEOPLE_PATH}/:id`, () => {
    it('should return 204 if the person was deleted', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const response = await request.delete(
        `${PEOPLE_PATH}/${postResponse.body.id}`
      );
      expect(response.status).toBe(204);
    });

    it('should return 404 if the person was not found', async () => {
      const response = await request.delete(`${PEOPLE_PATH}/123`);
      expect(response.status).toBe(404);
    });

    it('should actually delete the person', async () => {
      const postResponse = await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      await request.delete(`${PEOPLE_PATH}/${postResponse.body.id}`);

      const response = await request.get(
        `${PEOPLE_PATH}/${postResponse.body.id}`
      );
      expect(response.status).toBe(404);
    });

    it('should return 400 if the id is not a number', async () => {
      const response = await request.delete(`${PEOPLE_PATH}/not-a-number`);
      expect(response.status).toBe(400);
    });

    it('should return 400 if the id is not an integer', async () => {
      const response = await request.delete(`${PEOPLE_PATH}/1.5`);
      expect(response.status).toBe(400);
    });

    it('should return 400 if the id is less than 1', async () => {
      const response = await request.delete(`${PEOPLE_PATH}/0`);
      expect(response.status).toBe(400);
    });
  });

  describe(`DELETE ${PEOPLE_PATH}`, () => {
    it('should return 204 if the people were deleted', async () => {
      await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      const response = await request.delete(PEOPLE_PATH);
      expect(response.status).toBe(204);
    });

    it('should actually delete the people', async () => {
      await request.post(PEOPLE_PATH).send(PEOPLE[0]);

      await request.delete(PEOPLE_PATH);

      const response = await request.get(PEOPLE_PATH);
      expect(response.body).toEqual([]);
    });
  });

  describe('invalid request, 404', () => {
    it('should return 404 if the request is invalid', async () => {
      const response = await request.get('/test');

      expect(response.status).toBe(404);
    });
  });
});
