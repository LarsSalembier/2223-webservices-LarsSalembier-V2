import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Group } from '@prisma/client';
import supertest from 'supertest';
import Server from '../../core/Server.js';
import GroupSeeder from '../../seeders/group.js';

const AMOUNT_OF_GROUPS = 5;

const PATH = '/api/groups';

const server = new Server(9003);

const sortGroupsWithoutId = (a: Omit<Group, 'id'>, b: Omit<Group, 'id'>) => {
  return b.name.localeCompare(a.name);
};

function removeId(group: Group): Omit<Group, 'id'> {
  return {
    name: group.name,
    description: group.description,
    color: group.color,
    target: group.target,
  };
}

const GROUPS: Omit<Group, 'id'>[] = Array.from({
  length: AMOUNT_OF_GROUPS,
})
  .map(() => GroupSeeder.generate())
  .sort(sortGroupsWithoutId);

async function addAllGroups(request: supertest.SuperTest<supertest.Test>) {
  await Promise.all(
    GROUPS.map(async (group) => {
      return request.post(PATH).send(group);
    })
  );
}

describe('groups', () => {
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    await server.start();
    request = supertest(server.app.callback());
  });

  afterAll(async () => {
    await server.stop();
    await request.delete(PATH);
  });

  beforeEach(async () => {
    await request.delete(PATH);
  });

  describe(`GET ${PATH}`, () => {
    it('should return status 200', async () => {
      const response = await request.get(PATH);
      expect(response.status).toBe(200);
    });

    it('should return empty array if no groups', async () => {
      const response = await request.get(PATH);
      expect(response.body).toEqual([]);
    });

    it('should return all groups', async () => {
      await addAllGroups(request);

      const response = await request.get(PATH);
      expect(
        response.body
          .map((group: Group) => removeId(group))
          .sort(sortGroupsWithoutId)
      ).toEqual(GROUPS);
    });
  });

  describe(`GET ${PATH}/:id`, () => {
    it('should return status 200', async () => {
      const postResponse = await request.post(PATH).send(GROUPS[0]);

      const response = await request.get(`${PATH}/${postResponse.body.id}`);
      expect(response.status).toBe(200);
    });

    it('should return group by id', async () => {
      const postResponse = await request.post(PATH).send(GROUPS[0]);

      const response = await request.get(`${PATH}/${postResponse.body.id}`);
      expect(removeId(response.body)).toEqual(GROUPS[0]);
    });

    it('should return status 404 if group not found', async () => {
      const response = await request.get(`${PATH}/1`);
      expect(response.status).toBe(404);
    });

    it('should return 400 if id is not a number', async () => {
      const response = await request.get(`${PATH}/abc`);
      expect(response.status).toBe(400);
    });

    it('should return 400 if id is not an integer', async () => {
      const response = await request.get(`${PATH}/1.1`);
      expect(response.status).toBe(400);
    });

    it('should return 400 if id is negative', async () => {
      const response = await request.get(`${PATH}/-1`);
      expect(response.status).toBe(400);
    });

    it('should return 400 if id is zero', async () => {
      const response = await request.get(`${PATH}/0`);
      expect(response.status).toBe(400);
    });
  });

  describe(`POST ${PATH}`, () => {
    it('should return status 201', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);
      expect(response.status).toBe(201);
    });

    it('should return created group', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);
      expect(removeId(response.body)).toEqual(GROUPS[0]);
    });

    it('should return status 400 if name is empty', async () => {
      const response = await request.post(PATH).send({
        ...GROUPS[0],
        name: '',
      });
      expect(response.status).toBe(400);
    });

    it('should return status 400 if name is longer than 100 characters', async () => {
      const response = await request.post(PATH).send({
        ...GROUPS[0],
        name: 'a'.repeat(101),
      });
      expect(response.status).toBe(400);
    });

    it('should return status 400 if name is shorter than 3 characters', async () => {
      const response = await request.post(PATH).send({
        ...GROUPS[0],
        name: 'aa',
      });
      expect(response.status).toBe(400);
    });

    it('should trim name', async () => {
      const response = await request.post(PATH).send({
        ...GROUPS[0],
        name: '  name  ',
      });
      expect(response.body.name).toBe('name');
    });

    it('should return status 400 if name is missing', async () => {
      const response = await request.post(PATH).send({
        ...GROUPS[0],
        name: undefined,
      });
      expect(response.status).toBe(400);
    });

    it('should return status 400 if description is longer than 500 characters', async () => {
      const response = await request.post(PATH).send({
        ...GROUPS[0],
        description: 'a'.repeat(501),
      });
      expect(response.status).toBe(400);
    });

    it('should return status 400 if description is empty', async () => {
      const response = await request.post(PATH).send({
        ...GROUPS[0],
        description: '',
      });
      expect(response.status).toBe(400);
    });

    it('should return status 400 if description is missing', async () => {
      const response = await request.post(PATH).send({
        ...GROUPS[0],
        description: undefined,
      });
      expect(response.status).toBe(400);
    });

    it('should trim description', async () => {
      const response = await request.post(PATH).send({
        ...GROUPS[0],
        description: '  description  ',
      });
      expect(response.body.description).toBe('description');
    });

    it('should return status 400 if color is empty', async () => {
      const response = await request.post(PATH).send({
        ...GROUPS[0],
        color: '',
      });
      expect(response.status).toBe(400);
    });

    it('should return status 400 if color is longer than 30 characters', async () => {
      const response = await request.post(PATH).send({
        ...GROUPS[0],
        color: 'a'.repeat(31),
      });
      expect(response.status).toBe(400);
    });

    it('should trim color', async () => {
      const response = await request.post(PATH).send({
        ...GROUPS[0],
        color: '  color  ',
      });

      expect(response.body.color).toBe('color');
    });

    it('should return status 400 if target is empty', async () => {
      const response = await request.post(PATH).send({
        ...GROUPS[0],
        target: '',
      });
      expect(response.status).toBe(400);
    });

    it('should return status 400 if target is longer than 100 characters', async () => {
      const response = await request.post(PATH).send({
        ...GROUPS[0],
        target: 'a'.repeat(101),
      });
      expect(response.status).toBe(400);
    });

    it('should trim target', async () => {
      const response = await request.post(PATH).send({
        ...GROUPS[0],
        target: '  target  ',
      });
      expect(response.body.target).toBe('target');
    });
  });

  describe(`PUT ${PATH}/:id`, () => {
    it('should return status 200', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);

      const putResponse = await request
        .put(`${PATH}/${response.body.id}`)
        .send(GROUPS[1]);

      expect(putResponse.status).toBe(200);
    });

    it('should return updated group', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);

      const putResponse = await request
        .put(`${PATH}/${response.body.id}`)
        .send(GROUPS[1]);

      expect(removeId(putResponse.body)).toEqual(GROUPS[1]);
    });

    it('should actually update group', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);

      await request.put(`${PATH}/${response.body.id}`).send(GROUPS[1]);

      const getResponse = await request.get(`${PATH}/${response.body.id}`);

      expect(removeId(getResponse.body)).toEqual(GROUPS[1]);
    });

    it('should return status 404 if group not found', async () => {
      const response = await request.put(`${PATH}/1`).send(GROUPS[0]);
      expect(response.status).toBe(404);
    });

    it('should return status 400 if name is empty', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);

      const putResponse = await request
        .put(`${PATH}/${response.body.id}`)
        .send({ name: '' });

      expect(putResponse.status).toBe(400);
    });

    it('should return status 400 if name is longer than 100 characters', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);

      const putResponse = await request
        .put(`${PATH}/${response.body.id}`)
        .send({
          name: 'a'.repeat(101),
        });

      expect(putResponse.status).toBe(400);
    });

    it('should return status 400 if name is shorter than 3 characters', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);

      const putResponse = await request
        .put(`${PATH}/${response.body.id}`)
        .send({
          name: 'aa',
        });

      expect(putResponse.status).toBe(400);
    });

    it('should trim name', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);

      const putResponse = await request
        .put(`${PATH}/${response.body.id}`)
        .send({
          name: '  name  ',
        });

      expect(putResponse.body.name).toBe('name');
    });

    it('should return status 400 if description is longer than 500 characters', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);

      const putResponse = await request
        .put(`${PATH}/${response.body.id}`)
        .send({
          description: 'a'.repeat(501),
        });

      expect(putResponse.status).toBe(400);
    });

    it('should return status 400 if description is empty', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);

      const putResponse = await request
        .put(`${PATH}/${response.body.id}`)
        .send({
          description: '',
        });

      expect(putResponse.status).toBe(400);
    });

    it('should trim description', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);

      const putResponse = await request
        .put(`${PATH}/${response.body.id}`)
        .send({
          description: '  description  ',
        });

      expect(putResponse.body.description).toBe('description');
    });

    it('should return status 400 if color is empty', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);

      const putResponse = await request
        .put(`${PATH}/${response.body.id}`)
        .send({
          color: '',
        });

      expect(putResponse.status).toBe(400);
    });

    it('should return status 400 if color is longer than 30 characters', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);

      const putResponse = await request
        .put(`${PATH}/${response.body.id}`)
        .send({
          color: 'a'.repeat(31),
        });

      expect(putResponse.status).toBe(400);
    });

    it('should trim color', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);

      const putResponse = await request
        .put(`${PATH}/${response.body.id}`)
        .send({
          color: '  color  ',
        });

      expect(putResponse.body.color).toBe('color');
    });

    it('should return status 400 if target is empty', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);

      const putResponse = await request
        .put(`${PATH}/${response.body.id}`)
        .send({
          target: '',
        });

      expect(putResponse.status).toBe(400);
    });

    it('should return status 400 if target is longer than 100 characters', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);

      const putResponse = await request
        .put(`${PATH}/${response.body.id}`)
        .send({
          target: 'a'.repeat(101),
        });

      expect(putResponse.status).toBe(400);
    });

    it('should trim target', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);

      const putResponse = await request
        .put(`${PATH}/${response.body.id}`)
        .send({
          target: '  target  ',
        });

      expect(putResponse.body.target).toBe('target');
    });

    it('should return status 400 if id is not a number', async () => {
      const response = await request.put(`${PATH}/id`).send(GROUPS[0]);
      expect(response.status).toBe(400);
    });

    it('should return status 400 if id is not an integer', async () => {
      const response = await request.put(`${PATH}/1.1`).send(GROUPS[0]);
      expect(response.status).toBe(400);
    });

    it('should return status 400 if id is less than 1', async () => {
      const response = await request.put(`${PATH}/0`).send(GROUPS[0]);
      expect(response.status).toBe(400);
    });
  });

  describe(`DELETE ${PATH}/:id`, () => {
    it('should return status 204 if group deleted', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);

      const deleteResponse = await request.delete(
        `${PATH}/${response.body.id}`
      );

      expect(deleteResponse.status).toBe(204);
    });

    it('should actually delete group', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);

      await request.delete(`${PATH}/${response.body.id}`);

      const getResponse = await request.get(`${PATH}/${response.body.id}`);

      expect(getResponse.status).toBe(404);
    });

    it('should return status 404 if group not found', async () => {
      const response = await request.delete(`${PATH}/1`);
      expect(response.status).toBe(404);
    });

    it('should return status 400 if id is not a number', async () => {
      const response = await request.delete(`${PATH}/id`);
      expect(response.status).toBe(400);
    });

    it('should return status 400 if id is not an integer', async () => {
      const response = await request.delete(`${PATH}/1.1`);
      expect(response.status).toBe(400);
    });

    it('should return status 400 if id is less than 1', async () => {
      const response = await request.delete(`${PATH}/0`);
      expect(response.status).toBe(400);
    });
  });

  describe(`DELETE ${PATH}`, () => {
    it('should return status 204 if groups deleted', async () => {
      await request.post(PATH).send(GROUPS[0]);

      const deleteResponse = await request.delete(PATH);

      expect(deleteResponse.status).toBe(204);
    });

    it('should actually delete groups', async () => {
      const response = await request.post(PATH).send(GROUPS[0]);

      await request.delete(PATH);

      const getResponse = await request.get(`${PATH}/${response.body.id}`);

      expect(getResponse.status).toBe(404);
    });
  });
});
