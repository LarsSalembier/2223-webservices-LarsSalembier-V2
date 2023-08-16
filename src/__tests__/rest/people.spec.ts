/* eslint-disable import/no-extraneous-dependencies */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import { Person } from '@prisma/client';
import Server from '../../core/Server.js';
import PersonSeeder from '../../seeders/person.js';
import { StringifiedPersonData as IncomingPersonData } from '../../typings/Person.js';

const AMOUNT_OF_PEOPLE = 5;

const server = new Server();

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

const people: Omit<Person, 'id'>[] = Array.from({
  length: AMOUNT_OF_PEOPLE,
})
  .map(() => PersonSeeder.generate())
  .sort(sortPeople);

async function addAllPeople(request: supertest.SuperTest<supertest.Test>) {
  await Promise.all(
    people.map((person) => {
      return request.post('/api/people').send(person);
    })
  );
}

function incomingToReal(person: IncomingPersonData): Omit<Person, 'id'> {
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
    await request.delete('/api/people');
  });

  beforeEach(async () => {
    await request.delete('/api/people');
  });

  describe('GET /api/people', () => {
    it('should return 200', async () => {
      const response = await request.get('/api/people');
      expect(response.status).toBe(200);
    });

    it('should return an array of people', async () => {
      const response = await request.get('/api/people');
      expect(response.body).toBeInstanceOf(Array);
    });

    it('should return the correct amount of people', async () => {
      await addAllPeople(request);
      const response = await request.get('/api/people');
      expect(response.body.length).toBe(people.length);
    });

    it('should return the correct people', async () => {
      await addAllPeople(request);
      const response = await request.get('/api/people');
      const sortedResponse = response.body.sort(sortPeopleWithId);

      expect(sortedResponse.map(incomingToReal)).toEqual(people);
    });
  });

  describe('GET /api/people/:id', () => {
    it('should return 200', async () => {
      const creationResponse = await request
        .post('/api/people')
        .send(people[0]);

      const response = await request.get(creationResponse.header.location);

      expect(response.status).toBe(200);
    });

    it('should return the correct person', async () => {
      const creationResponse = await request
        .post('/api/people')
        .send(people[0]);

      const response = await request.get(creationResponse.header.location);

      expect(incomingToReal(response.body)).toEqual(people[0]);
    });

    it('should return 404 if the person does not exist', async () => {
      const response = await request.get('/api/people/1');

      expect(response.status).toBe(404);
    });

    it('should return 400 if the id is not a number', async () => {
      const response = await request.get('/api/people/abc');

      expect(response.status).toBe(400);
    });

    it('should return 400 if the id is not an integer', async () => {
      const response = await request.get('/api/people/1.5');

      expect(response.status).toBe(400);
    });

    it('should return 400 if the id is negative', async () => {
      const response = await request.get('/api/people/-1');

      expect(response.status).toBe(400);
    });

    it('should return 400 if the id is zero', async () => {
      const response = await request.get('/api/people/0');

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/people', () => {
    it('should return 201', async () => {
      const response = await request.post('/api/people').send(people[0]);
      expect(response.status).toBe(201);
    });

    it('should actually create the person', async () => {
      const postResponse = await request.post('/api/people').send(people[0]);

      const getResponse = await request.get(postResponse.header.location);
      expect(incomingToReal(getResponse.body)).toEqual(people[0]);
    });

    it('should return the location of the created person', async () => {
      const response = await request.post('/api/people').send(people[0]);

      const person = await request.get(response.header.location);
      expect(incomingToReal(person.body)).toEqual(people[0]);
    });

    it('should return 400 if the name is missing', async () => {
      const response = await request.post('/api/people').send({});
      expect(response.status).toBe(400);
    });

    it('should return 400 if the name is more than 100 characters long', async () => {
      const response = await request.post('/api/people').send({
        name: 'a'.repeat(101),
      });
      expect(response.status).toBe(400);
    });

    it('should return 400 if the name is less than 3 characters long', async () => {
      const response = await request.post('/api/people').send({
        name: 'aa',
      });
      expect(response.status).toBe(400);
    });

    it('should trim the name', async () => {
      const postResponse = await request.post('/api/people').send({
        name: '   abc   ',
      });

      const getResponse = await request.get(postResponse.header.location);
      expect(getResponse.body.name).toBe('abc');
    });

    it('should return 400 if the email is not an email', async () => {
      const response = await request.post('/api/people').send({
        name: 'a'.repeat(3),
        email: 'not an email',
      });
      expect(response.status).toBe(400);
    });

    it('should return 400 if the email is more than 100 characters long', async () => {
      const response = await request.post('/api/people').send({
        name: 'a'.repeat(3),
        email: `${'a'.repeat(50)}.${'a'.repeat(50)}@gmail.com`,
      });
      expect(response.status).toBe(400);
    });

    it('should trim the email', async () => {
      const postResponse = await request.post('/api/people').send({
        name: 'a'.repeat(3),
        email: '    a.b@gmail.com   ',
      });

      const getResponse = await request.get(postResponse.header.location);
      expect(getResponse.body.email).toBe('a.b@gmail.com');
    });

    it('should trim the phoneNumber', async () => {
      const postResponse = await request.post('/api/people').send({
        name: 'a'.repeat(3),
        phoneNumber: '   123456789   ',
      });

      const getResponse = await request.get(postResponse.header.location);
      expect(getResponse.body.phoneNumber).toBe('123456789');
    });

    it('should return 400 if the phoneNumber is more than 30 characters long', async () => {
      const response = await request.post('/api/people').send({
        name: 'a'.repeat(3),
        phoneNumber: 'a'.repeat(31),
      });
      expect(response.status).toBe(400);
    });

    it('should trim the bio', async () => {
      const postResponse = await request.post('/api/people').send({
        name: 'a'.repeat(3),
        bio: '   abc   ',
      });

      const getResponse = await request.get(postResponse.header.location);
      expect(getResponse.body.bio).toBe('abc');
    });

    it('should return 400 if the bio is more than 500 characters long', async () => {
      const response = await request.post('/api/people').send({
        name: 'a'.repeat(3),
        bio: 'a'.repeat(501),
      });
      expect(response.status).toBe(400);
    });

    it('should trim studiesOrJob', async () => {
      const postResponse = await request.post('/api/people').send({
        name: 'a'.repeat(3),
        studiesOrJob: '   abc   ',
      });

      const getResponse = await request.get(postResponse.header.location);
      expect(getResponse.body.studiesOrJob).toBe('abc');
    });

    it('should return 400 if studiesOrJob is more than 100 characters long', async () => {
      const response = await request.post('/api/people').send({
        name: 'a'.repeat(3),
        studiesOrJob: 'a'.repeat(101),
      });
      expect(response.status).toBe(400);
    });

    it('should return 400 if the birthdate is not a date', async () => {
      const response = await request.post('/api/people').send({
        name: 'a'.repeat(3),
        birthdate: 'not a date',
      });
      expect(response.status).toBe(400);
    });

    it('should return 400 if the birthdate is in the future', async () => {
      const response = await request.post('/api/people').send({
        name: 'a'.repeat(3),
        birthdate: '2100-01-01',
      });
      expect(response.status).toBe(400);
    });

    it('should return 400 if the birthdate is before 1900', async () => {
      const response = await request.post('/api/people').send({
        name: 'a'.repeat(3),
        birthdate: '1899-12-31',
      });
      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/people/:id', () => {
    it('should return 204', async () => {
      const postResponse = await request.post('/api/people').send(people[0]);

      const response = await request
        .put(postResponse.header.location)
        .send({ name: 'new name' });
      expect(response.status).toBe(204);
    });

    it('should actually update the person', async () => {
      const postResponse = await request.post('/api/people').send(people[0]);

      await request.put(postResponse.header.location).send(people[1]);

      const getResponse = await request.get(postResponse.header.location);
      expect(incomingToReal(getResponse.body)).toEqual(people[1]);
    });

    it('should return 404 if the person does not exist', async () => {
      const response = await request
        .put('/api/people/1')
        .send({ name: 'new name' });
      expect(response.status).toBe(404);
    });

    it('should return 400 if the name is less than 3 characters long', async () => {
      const postResponse = await request.post('/api/people').send(people[0]);

      const response = await request
        .put(postResponse.header.location)
        .send({ name: 'aa' });
      expect(response.status).toBe(400);
    });

    it('should return 400 if the name is more than 100 characters long', async () => {
      const postResponse = await request.post('/api/people').send(people[0]);

      const response = await request
        .put(postResponse.header.location)
        .send({ name: 'a'.repeat(101) });
      expect(response.status).toBe(400);
    });

    it('should trim the name', async () => {
      const postResponse = await request.post('/api/people').send(people[0]);

      await request.put(postResponse.header.location).send({
        name: '   abc   ',
      });

      const getResponse = await request.get(postResponse.header.location);
      expect(getResponse.body.name).toBe('abc');
    });

    it('should return 400 if the email is not an email', async () => {
      const postResponse = await request.post('/api/people').send(people[0]);

      const response = await request
        .put(postResponse.header.location)
        .send({ email: 'not an email' });
      expect(response.status).toBe(400);
    });

    it('should return 400 if the email is more than 100 characters long', async () => {
      const postResponse = await request.post('/api/people').send(people[0]);

      const response = await request
        .put(postResponse.header.location)
        .send({ email: `${'a'.repeat(50)}.${'a'.repeat(50)}@gmail.com` });
      expect(response.status).toBe(400);
    });

    it('should trim the email', async () => {
      const postResponse = await request.post('/api/people').send(people[0]);

      await request.put(postResponse.header.location).send({
        email: '     a.b@gmail.com     ',
      });

      const getResponse = await request.get(postResponse.header.location);
      expect(getResponse.body.email).toBe('a.b@gmail.com');
    });

    it('should return 400 if the phoneNumber is more than 30 characters long', async () => {
      const postResponse = await request.post('/api/people').send(people[0]);

      const response = await request
        .put(postResponse.header.location)
        .send({ phoneNumber: 'a'.repeat(31) });
      expect(response.status).toBe(400);
    });

    it('should trim the phoneNumber', async () => {
      const postResponse = await request.post('/api/people').send(people[0]);

      await request.put(postResponse.header.location).send({
        phoneNumber: '   123456789   ',
      });

      const getResponse = await request.get(postResponse.header.location);
      expect(getResponse.body.phoneNumber).toBe('123456789');
    });

    it('should return 400 if the bio is more than 500 characters long', async () => {
      const postResponse = await request.post('/api/people').send(people[0]);

      const response = await request
        .put(postResponse.header.location)
        .send({ bio: 'a'.repeat(501) });
      expect(response.status).toBe(400);
    });

    it('should trim the bio', async () => {
      const postResponse = await request.post('/api/people').send(people[0]);

      await request.put(postResponse.header.location).send({
        bio: '   abc   ',
      });

      const getResponse = await request.get(postResponse.header.location);
      expect(getResponse.body.bio).toBe('abc');
    });

    it('should return 400 if the studiesOrJob is more than 100 characters long', async () => {
      const postResponse = await request.post('/api/people').send(people[0]);

      const response = await request
        .put(postResponse.header.location)
        .send({ studiesOrJob: 'a'.repeat(101) });
      expect(response.status).toBe(400);
    });

    it('should trim the studiesOrJob', async () => {
      const postResponse = await request.post('/api/people').send(people[0]);

      await request.put(postResponse.header.location).send({
        studiesOrJob: '   abc   ',
      });

      const getResponse = await request.get(postResponse.header.location);
      expect(getResponse.body.studiesOrJob).toBe('abc');
    });

    it('should return 400 if the birthdate is not a date', async () => {
      const postResponse = await request.post('/api/people').send(people[0]);

      const response = await request
        .put(postResponse.header.location)
        .send({ birthdate: 'not a date' });
      expect(response.status).toBe(400);
    });

    it('should return 400 if the birthdate is in the future', async () => {
      const postResponse = await request.post('/api/people').send(people[0]);

      const response = await request
        .put(postResponse.header.location)
        .send({ birthdate: '2100-01-01' });
      expect(response.status).toBe(400);
    });

    it('should return 400 if the birthdate is before 1900-01-01', async () => {
      const postResponse = await request.post('/api/people').send(people[0]);

      const response = await request
        .put(postResponse.header.location)
        .send({ birthdate: '1899-12-31' });
      expect(response.status).toBe(400);
    });

    it('should return 400 if the id is not a number', async () => {
      const response = await request.put('/api/people/abc').send(people[0]);
      expect(response.status).toBe(400);
    });

    it('should return 400 if the id is not an integer', async () => {
      const response = await request.put('/api/people/1.1').send(people[0]);
      expect(response.status).toBe(400);
    });

    it('should return 400 if the id is less than 1', async () => {
      const response = await request.put('/api/people/0').send(people[0]);
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/people/:id', () => {
    it('should return 204 if the person was deleted', async () => {
      const postResponse = await request.post('/api/people').send(people[0]);

      const response = await request.delete(postResponse.header.location);
      expect(response.status).toBe(204);
    });

    it('should return 404 if the person was not found', async () => {
      const response = await request.delete('/api/people/1');
      expect(response.status).toBe(404);
    });

    it('should actually delete the person', async () => {
      const postResponse = await request.post('/api/people').send(people[0]);

      await request.delete(postResponse.header.location);

      const response = await request.get(postResponse.header.location);
      expect(response.status).toBe(404);
    });

    it('should return 400 if the id is not a number', async () => {
      const response = await request.delete('/api/people/not-a-number');
      expect(response.status).toBe(400);
    });

    it('should return 400 if the id is not an integer', async () => {
      const response = await request.delete('/api/people/1.5');
      expect(response.status).toBe(400);
    });

    it('should return 400 if the id is less than 1', async () => {
      const response = await request.delete('/api/people/0');
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/people', () => {
    it('should return 204 if the people were deleted', async () => {
      await request.post('/api/people').send(people[0]);

      const response = await request.delete('/api/people');
      expect(response.status).toBe(204);
    });

    it('should actually delete the people', async () => {
      await request.post('/api/people').send(people[0]);

      await request.delete('/api/people');

      const response = await request.get('/api/people');
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
