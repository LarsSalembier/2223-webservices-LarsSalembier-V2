import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Administrator } from '@prisma/client';
import supertest from 'supertest';
import Server from '../../core/Server.js';
import AdministratorSeeder from '../../seeders/administrator.js';

export const AMOUNT_OF_ADMINISTRATORS = 5;

export const ADMINISTRATOR_PATH = '/api/administrators';

const server = new Server(9000);

const sortAdministrators = (a: Administrator, b: Administrator) => {
  return a.auth0id.localeCompare(b.auth0id);
};

export const ADMINISTRATORS: Administrator[] = Array.from({
  length: AMOUNT_OF_ADMINISTRATORS,
})
  .map(() => AdministratorSeeder.generate())
  .sort(sortAdministrators);

async function addAllAdministrators(
  request: supertest.SuperTest<supertest.Test>
) {
  await Promise.all(
    ADMINISTRATORS.map(async (administrator) => {
      return request.post(ADMINISTRATOR_PATH).send(administrator);
    })
  );
}

describe('administrators', () => {
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    await server.start();
    request = supertest(server.app.callback());
  });

  afterAll(async () => {
    await server.stop();
    await request.delete(ADMINISTRATOR_PATH);
  });

  beforeEach(async () => {
    await request.delete(ADMINISTRATOR_PATH);
  });

  describe(`GET ${ADMINISTRATOR_PATH}`, () => {
    it('should return status 200', async () => {
      const response = await request.get(ADMINISTRATOR_PATH);

      expect(response.status).toBe(200);
    });

    it('should return all administrators', async () => {
      await addAllAdministrators(request);

      const response = await request.get(ADMINISTRATOR_PATH);

      expect(response.body.sort(sortAdministrators)).toEqual(ADMINISTRATORS);
    });

    it('should return empty array if no administrators', async () => {
      const response = await request.get(ADMINISTRATOR_PATH);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/administrators/:auth0id', () => {
    it('should return status 200', async () => {
      await request.post(ADMINISTRATOR_PATH).send(ADMINISTRATORS[0]);

      const response = await request.get(
        `${ADMINISTRATOR_PATH}/${(ADMINISTRATORS[0] as Administrator).auth0id}`
      );

      expect(response.status).toBe(200);
    });

    it('should return the administrator', async () => {
      await request.post(ADMINISTRATOR_PATH).send(ADMINISTRATORS[0]);

      const response = await request.get(
        `${ADMINISTRATOR_PATH}/${(ADMINISTRATORS[0] as Administrator).auth0id}`
      );

      expect(response.body).toEqual(ADMINISTRATORS[0]);
    });

    it('should return status 404 if administrator not found', async () => {
      const response = await request.get(`${ADMINISTRATOR_PATH}/notfound`);

      expect(response.status).toBe(404);
    });
  });

  describe(`POST ${ADMINISTRATOR_PATH}`, () => {
    it('should return status 201', async () => {
      const response = await request
        .post(ADMINISTRATOR_PATH)
        .send(ADMINISTRATORS[0]);

      expect(response.status).toBe(201);
    });

    it('should return the administrator', async () => {
      const response = await request
        .post(ADMINISTRATOR_PATH)
        .send(ADMINISTRATORS[0]);

      expect(response.body).toEqual(ADMINISTRATORS[0]);
    });

    it('should actually create the administrator', async () => {
      await request.post(ADMINISTRATOR_PATH).send(ADMINISTRATORS[0]);

      const response = await request.get(
        `${ADMINISTRATOR_PATH}/${(ADMINISTRATORS[0] as Administrator).auth0id}`
      );

      expect(response.body).toEqual(ADMINISTRATORS[0]);
    });

    it('should return status 409 if auth0id is already in use', async () => {
      await request.post(ADMINISTRATOR_PATH).send(ADMINISTRATORS[0]);

      const response = await request.post(ADMINISTRATOR_PATH).send({
        ...ADMINISTRATORS[1],
        auth0id: (ADMINISTRATORS[0] as Administrator).auth0id,
      });

      expect(response.status).toBe(409);
    });

    it('should return status 409 if the username is already in use', async () => {
      await request.post(ADMINISTRATOR_PATH).send(ADMINISTRATORS[0]);

      const response = await request.post(ADMINISTRATOR_PATH).send({
        ...ADMINISTRATORS[1],
        username: (ADMINISTRATORS[0] as Administrator).username,
      });

      expect(response.status).toBe(409);
    });

    it('should return status 400 if auth0id is missing', async () => {
      const response = await request.post(ADMINISTRATOR_PATH).send({
        ...ADMINISTRATORS[0],
        auth0id: undefined,
      });

      expect(response.status).toBe(400);
    });

    it('should return status 400 if auth0id is empty', async () => {
      const response = await request.post(ADMINISTRATOR_PATH).send({
        ...ADMINISTRATORS[0],
        auth0id: '',
      });

      expect(response.status).toBe(400);
    });

    it('should return status 400 if username is missing', async () => {
      const response = await request.post(ADMINISTRATOR_PATH).send({
        ...ADMINISTRATORS[0],
        username: undefined,
      });

      expect(response.status).toBe(400);
    });

    it('should return status 400 if username is empty', async () => {
      const response = await request.post(ADMINISTRATOR_PATH).send({
        ...ADMINISTRATORS[0],
        username: '',
      });

      expect(response.status).toBe(400);
    });

    it('should return status 400 if username is shorter than 3 characters', async () => {
      const response = await request.post(ADMINISTRATOR_PATH).send({
        ...ADMINISTRATORS[0],
        username: 'ab',
      });

      expect(response.status).toBe(400);
    });

    it('should return status 400 if username is longer than 30 characters', async () => {
      const response = await request.post(ADMINISTRATOR_PATH).send({
        ...ADMINISTRATORS[0],
        username: 'a'.repeat(31),
      });

      expect(response.status).toBe(400);
    });

    it('should return status 400 if email is missing', async () => {
      const response = await request.post(ADMINISTRATOR_PATH).send({
        ...ADMINISTRATORS[0],
        email: undefined,
      });

      expect(response.status).toBe(400);
    });

    it('should return status 400 if email is empty', async () => {
      const response = await request.post(ADMINISTRATOR_PATH).send({
        ...ADMINISTRATORS[0],
        email: '',
      });

      expect(response.status).toBe(400);
    });

    it('should return status 400 if email is not an email', async () => {
      const response = await request.post(ADMINISTRATOR_PATH).send({
        ...ADMINISTRATORS[0],
        email: 'notanemail',
      });

      expect(response.status).toBe(400);
    });
  });

  describe(`PUT ${ADMINISTRATOR_PATH}/:auth0id`, () => {
    it('should return status 200', async () => {
      await request.post(ADMINISTRATOR_PATH).send(ADMINISTRATORS[0]);

      const response = await request
        .put(
          `${ADMINISTRATOR_PATH}/${
            (ADMINISTRATORS[0] as Administrator).auth0id
          }`
        )
        .send({
          username: 'newusername',
          email: 'new.email@gmail.com',
        });

      expect(response.status).toBe(200);
    });

    it('should return the administrator', async () => {
      await request.post(ADMINISTRATOR_PATH).send(ADMINISTRATORS[0]);

      const response = await request
        .put(
          `${ADMINISTRATOR_PATH}/${
            (ADMINISTRATORS[0] as Administrator).auth0id
          }`
        )
        .send({
          username: 'newusername',
          email: 'new.email@gmail.com',
        });

      expect(response.body).toEqual({
        ...ADMINISTRATORS[0],
        username: 'newusername',
        email: 'new.email@gmail.com',
      });
    });

    it('should actually update the administrator', async () => {
      await request.post(ADMINISTRATOR_PATH).send(ADMINISTRATORS[0]);

      await request
        .put(
          `${ADMINISTRATOR_PATH}/${
            (ADMINISTRATORS[0] as Administrator).auth0id
          }`
        )
        .send({
          username: 'newusername',
          email: 'new.email@gmail.com',
        });

      const response = await request.get(
        `${ADMINISTRATOR_PATH}/${(ADMINISTRATORS[0] as Administrator).auth0id}`
      );

      expect(response.body).toEqual({
        ...ADMINISTRATORS[0],
        username: 'newusername',
        email: 'new.email@gmail.com',
      });
    });

    it('should return status 409 if username is already in use', async () => {
      await request.post(ADMINISTRATOR_PATH).send(ADMINISTRATORS[0]);
      await request.post(ADMINISTRATOR_PATH).send(ADMINISTRATORS[1]);

      const response = await request
        .put(
          `${ADMINISTRATOR_PATH}/${
            (ADMINISTRATORS[0] as Administrator).auth0id
          }`
        )
        .send({
          username: (ADMINISTRATORS[1] as Administrator).username,
        });

      expect(response.status).toBe(409);
    });

    it('should return status 400 if username is shorter than 3 characters', async () => {
      await request.post(ADMINISTRATOR_PATH).send(ADMINISTRATORS[0]);

      const response = await request
        .put(
          `${ADMINISTRATOR_PATH}/${
            (ADMINISTRATORS[0] as Administrator).auth0id
          }`
        )
        .send({
          username: 'ab',
        });

      expect(response.status).toBe(400);
    });

    it('should return status 400 if username is longer than 30 characters', async () => {
      await request.post(ADMINISTRATOR_PATH).send(ADMINISTRATORS[0]);

      const response = await request
        .put(
          `${ADMINISTRATOR_PATH}/${
            (ADMINISTRATORS[0] as Administrator).auth0id
          }`
        )
        .send({
          username: 'a'.repeat(31),
        });

      expect(response.status).toBe(400);
    });

    it('should return status 400 if email is not an email', async () => {
      await request.post(ADMINISTRATOR_PATH).send(ADMINISTRATORS[0]);

      const response = await request
        .put(
          `${ADMINISTRATOR_PATH}/${
            (ADMINISTRATORS[0] as Administrator).auth0id
          }`
        )
        .send({
          email: 'notanemail',
        });

      expect(response.status).toBe(400);
    });

    it('should return status 404 if administrator does not exist', async () => {
      const response = await request
        .put(
          `${ADMINISTRATOR_PATH}/${
            (ADMINISTRATORS[0] as Administrator).auth0id
          }`
        )
        .send({
          username: 'newusername',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /administrators/:auth0id', () => {
    it('should return status 204', async () => {
      await request.post(ADMINISTRATOR_PATH).send(ADMINISTRATORS[0]);

      const response = await request.delete(
        `${ADMINISTRATOR_PATH}/${(ADMINISTRATORS[0] as Administrator).auth0id}`
      );

      expect(response.status).toBe(204);
    });

    it('should actually delete the administrator', async () => {
      await request.post(ADMINISTRATOR_PATH).send(ADMINISTRATORS[0]);

      await request.delete(
        `${ADMINISTRATOR_PATH}/${(ADMINISTRATORS[0] as Administrator).auth0id}`
      );

      const response = await request.get(
        `${ADMINISTRATOR_PATH}/${(ADMINISTRATORS[0] as Administrator).auth0id}`
      );

      expect(response.status).toBe(404);
    });

    it('should return status 404 if administrator does not exist', async () => {
      const response = await request.delete(
        `${ADMINISTRATOR_PATH}/${(ADMINISTRATORS[0] as Administrator).auth0id}`
      );

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /administrators', () => {
    it('should return status 204', async () => {
      await request.post(ADMINISTRATOR_PATH).send(ADMINISTRATORS[0]);

      const response = await request.delete(ADMINISTRATOR_PATH);

      expect(response.status).toBe(204);
    });

    it('should actually delete all administrators', async () => {
      await request.post(ADMINISTRATOR_PATH).send(ADMINISTRATORS[0]);

      await request.delete(ADMINISTRATOR_PATH);

      const response = await request.get(ADMINISTRATOR_PATH);

      expect(response.body).toEqual([]);
    });
  });
});
