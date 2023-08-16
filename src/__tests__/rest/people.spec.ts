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
  .map(() => PersonSeeder.generatePerson())
  .sort(sortPeople);

// const stringifiedPeople: StringifiedPersonData[] = people.map((person) => ({
//   name: person.name,
//   email: person.email ?? undefined,
//   phoneNumber: person.phoneNumber ?? undefined,
//   bio: person.bio ?? undefined,
//   studiesOrJob: person.studiesOrJob ?? undefined,
//   birthdate: person.birthdate?.toString() ?? undefined,
// }));

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

  describe('POST /api/people', () => {
    it('should return 201', async () => {
      const response = await request.post('/api/people').send(people[0]);
      expect(response.status).toBe(201);
    });

    it('should return the location of the created person', async () => {
      const response = await request.post('/api/people').send(people[0]);

      const person = await request.get(response.header.location);
      expect(incomingToReal(person.body)).toEqual(people[0]);
    });

    it('should return 400 if the name is missing', async () => {
      const response = await request.post('/api/people').send({});
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Missing name',
      });
    });

    it('should return 400 if the name is empty', async () => {
      const response = await request.post('/api/people').send({
        name: '',
      });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Missing name',
      });
    });

    it('should return 400 if the name is too long', async () => {
      const response = await request.post('/api/people').send({
        name: 'a'.repeat(101),
      });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Name too long',
      });
    });
  });
});
