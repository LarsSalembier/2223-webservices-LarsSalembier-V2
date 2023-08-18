import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Group } from '@prisma/client';
import supertest from 'supertest';
import Server from '../../core/Server.js';
import GroupSeeder from '../../seeders/GroupSeeder.js';
import { PEOPLE, PEOPLE_PATH } from './people.spec.js';
import { getAuthHeader } from '../helpers.js';

const AMOUNT_OF_GROUPS = 5;

export const GROUPS_PATH = '/api/groups';

const server = new Server(9002);

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

const authHeader = await getAuthHeader();

export const GROUPS: Omit<Group, 'id'>[] = Array.from({
  length: AMOUNT_OF_GROUPS,
})
  .map(() => GroupSeeder.generate())
  .sort(sortGroupsWithoutId);

async function addAllGroups(request: supertest.SuperTest<supertest.Test>) {
  await Promise.all(
    GROUPS.map(async (group) => {
      return request
        .post(GROUPS_PATH)
        .send(group)
        .set('Authorization', authHeader);
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
    await request.delete(GROUPS_PATH).set('Authorization', authHeader);
    await request.delete(PEOPLE_PATH).set('Authorization', authHeader);
  });

  beforeEach(async () => {
    await request.delete(GROUPS_PATH).set('Authorization', authHeader);
    await request.delete(PEOPLE_PATH).set('Authorization', authHeader);
  });

  describe(`GET ${GROUPS_PATH}`, () => {
    it('should return status 200', async () => {
      const response = await request
        .get(GROUPS_PATH)
        .set('Authorization', authHeader);
      expect(response.status).toBe(200);
    });

    it('should return empty array if no groups', async () => {
      const response = await request
        .get(GROUPS_PATH)
        .set('Authorization', authHeader);
      expect(response.body).toEqual([]);
    });

    it('should return all groups', async () => {
      await addAllGroups(request);

      const response = await request
        .get(GROUPS_PATH)
        .set('Authorization', authHeader);
      expect(
        response.body
          .map((group: Group) => removeId(group))
          .sort(sortGroupsWithoutId)
      ).toEqual(GROUPS);
    });
  });

  describe(`GET ${GROUPS_PATH}/:id`, () => {
    it('should return status 200', async () => {
      const postResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const response = await request
        .get(`${GROUPS_PATH}/${postResponse.body.id}`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(200);
    });

    it('should return group by id', async () => {
      const postResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const response = await request
        .get(`${GROUPS_PATH}/${postResponse.body.id}`)
        .set('Authorization', authHeader);
      expect(removeId(response.body)).toEqual(GROUPS[0]);
    });

    it('should return status 404 if group not found', async () => {
      const response = await request
        .get(`${GROUPS_PATH}/1`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(404);
    });

    it('should return 400 if id is not a number', async () => {
      const response = await request
        .get(`${GROUPS_PATH}/abc`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return 400 if id is not an integer', async () => {
      const response = await request
        .get(`${GROUPS_PATH}/1.1`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return 400 if id is negative', async () => {
      const response = await request
        .get(`${GROUPS_PATH}/-1`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return 400 if id is zero', async () => {
      const response = await request
        .get(`${GROUPS_PATH}/0`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });
  });

  describe(`GET ${GROUPS_PATH}/:id/members`, () => {
    it('should return status 200', async () => {
      const postResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const response = await request
        .get(`${GROUPS_PATH}/${postResponse.body.id}/members`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(200);
    });

    it('should return empty array if no members', async () => {
      const postResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const response = await request
        .get(`${GROUPS_PATH}/${postResponse.body.id}/members`)
        .set('Authorization', authHeader);
      expect(response.body).toEqual([]);
    });

    it('should return all members', async () => {
      const postPersonReponse = await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[0])
        .set('Authorization', authHeader);
      const postPerson2Reponse = await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[1])
        .set('Authorization', authHeader);

      const postResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      await request
        .post(`${GROUPS_PATH}/${postResponse.body.id}/members`)
        .send({
          personId: postPersonReponse.body.id,
        })
        .set('Authorization', authHeader);

      await request
        .post(`${GROUPS_PATH}/${postResponse.body.id}/members`)
        .send({
          personId: postPerson2Reponse.body.id,
        })
        .set('Authorization', authHeader);

      const response = await request
        .get(`${GROUPS_PATH}/${postResponse.body.id}/members`)
        .set('Authorization', authHeader);

      expect(response.body).toEqual([
        {
          ...PEOPLE[0],
          id: postPersonReponse.body.id,
          birthdate: postPersonReponse.body.birthdate.toString(),
        },
        {
          ...PEOPLE[1],
          id: postPerson2Reponse.body.id,
          birthdate: postPerson2Reponse.body.birthdate.toString(),
        },
      ]);
    });

    it('should return status 404 if group not found', async () => {
      const response = await request
        .get(`${GROUPS_PATH}/123/members`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(404);
    });

    it('should return 400 if id is not a number', async () => {
      const response = await request
        .get(`${GROUPS_PATH}/abc/members`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return 400 if id is not an integer', async () => {
      const response = await request
        .get(`${GROUPS_PATH}/1.1/members`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return 400 if id is negative', async () => {
      const response = await request
        .get(`${GROUPS_PATH}/-1/members`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return 400 if id is zero', async () => {
      const response = await request
        .get(`${GROUPS_PATH}/0/members`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });
  });

  describe(`POST ${GROUPS_PATH}`, () => {
    it('should return status 201', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);
      expect(response.status).toBe(201);
    });

    it('should return created group', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);
      expect(removeId(response.body)).toEqual(GROUPS[0]);
    });

    it('should return status 400 if name is empty', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send({
          ...GROUPS[0],
          name: '',
        })
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return status 400 if name is longer than 100 characters', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send({
          ...GROUPS[0],
          name: 'a'.repeat(101),
        })
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return status 400 if name is shorter than 3 characters', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send({
          ...GROUPS[0],
          name: 'aa',
        })
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should trim name', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send({
          ...GROUPS[0],
          name: '  name  ',
        })
        .set('Authorization', authHeader);
      expect(response.body.name).toBe('name');
    });

    it('should return status 400 if name is missing', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send({
          ...GROUPS[0],
          name: undefined,
        })
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return status 400 if description is longer than 500 characters', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send({
          ...GROUPS[0],
          description: 'a'.repeat(501),
        })
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return status 400 if description is empty', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send({
          ...GROUPS[0],
          description: '',
        })
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return status 400 if description is missing', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send({
          ...GROUPS[0],
          description: undefined,
        })
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should trim description', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send({
          ...GROUPS[0],
          description: '  description  ',
        })
        .set('Authorization', authHeader);
      expect(response.body.description).toBe('description');
    });

    it('should return status 400 if color is empty', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send({
          ...GROUPS[0],
          color: '',
        })
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return status 400 if color is longer than 30 characters', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send({
          ...GROUPS[0],
          color: 'a'.repeat(31),
        })
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should trim color', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send({
          ...GROUPS[0],
          color: '  color  ',
        })
        .set('Authorization', authHeader);

      expect(response.body.color).toBe('color');
    });

    it('should return status 400 if target is empty', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send({
          ...GROUPS[0],
          target: '',
        })
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return status 400 if target is longer than 100 characters', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send({
          ...GROUPS[0],
          target: 'a'.repeat(101),
        })
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should trim target', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send({
          ...GROUPS[0],
          target: '  target  ',
        })
        .set('Authorization', authHeader);
      expect(response.body.target).toBe('target');
    });
  });

  describe(`POST ${GROUPS_PATH}/:id/members`, () => {
    it('should return status 201', async () => {
      const postResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);
      const personPostResponse = await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[0])
        .set('Authorization', authHeader);

      const response = await request
        .post(`${GROUPS_PATH}/${postResponse.body.id}/members`)
        .send({
          personId: personPostResponse.body.id,
        })
        .set('Authorization', authHeader);

      expect(response.status).toBe(201);
    });

    it('should actually add member to group', async () => {
      const postResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);
      const personPostResponse = await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[0])
        .set('Authorization', authHeader);

      await request
        .post(`${GROUPS_PATH}/${postResponse.body.id}/members`)
        .send({
          personId: personPostResponse.body.id,
        })
        .set('Authorization', authHeader);

      const response = await request
        .get(`${GROUPS_PATH}/${postResponse.body.id}/members`)
        .set('Authorization', authHeader);

      expect(response.body).toEqual([personPostResponse.body]);
    });

    it('should return status 400 if personId is empty', async () => {
      const postResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const response = await request
        .post(`${GROUPS_PATH}/${postResponse.body.id}/members`)
        .send({
          personId: '',
        })
        .set('Authorization', authHeader);

      expect(response.status).toBe(400);
    });

    it('should return status 400 if personId is missing', async () => {
      const postResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const response = await request
        .post(`${GROUPS_PATH}/${postResponse.body.id}/members`)
        .send({
          personId: undefined,
        })
        .set('Authorization', authHeader);

      expect(response.status).toBe(400);
    });

    it('should return status 400 if personId is not a number', async () => {
      const postResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const response = await request
        .post(`${GROUPS_PATH}/${postResponse.body.id}/members`)
        .send({
          personId: 'a',
        })
        .set('Authorization', authHeader);

      expect(response.status).toBe(400);
    });

    it('should return status 400 if personId is not an integer', async () => {
      const postResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const response = await request
        .post(`${GROUPS_PATH}/${postResponse.body.id}/members`)
        .send({
          personId: 1.1,
        })
        .set('Authorization', authHeader);

      expect(response.status).toBe(400);
    });

    it('should return status 400 if personId is not a positive number', async () => {
      const postResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const response = await request
        .post(`${GROUPS_PATH}/${postResponse.body.id}/members`)
        .send({
          personId: -1,
        })
        .set('Authorization', authHeader);

      expect(response.status).toBe(400);
    });

    it('should return status 400 if personId is 0', async () => {
      const postResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const response = await request
        .post(`${GROUPS_PATH}/${postResponse.body.id}/members`)
        .send({
          personId: 0,
        })
        .set('Authorization', authHeader);

      expect(response.status).toBe(400);
    });

    it('should return status 400 if group id is not a number', async () => {
      const response = await request
        .post(`${GROUPS_PATH}/a/members`)
        .send({
          personId: 1,
        })
        .set('Authorization', authHeader);

      expect(response.status).toBe(400);
    });

    it('should return status 400 if group id is not an integer', async () => {
      const response = await request
        .post(`${GROUPS_PATH}/1.1/members`)
        .send({
          personId: 1,
        })
        .set('Authorization', authHeader);

      expect(response.status).toBe(400);
    });

    it('should return status 400 if group id is not a positive number', async () => {
      const response = await request
        .post(`${GROUPS_PATH}/-1/members`)
        .send({
          personId: 1,
        })
        .set('Authorization', authHeader);

      expect(response.status).toBe(400);
    });

    it('should return status 400 if group id is 0', async () => {
      const response = await request
        .post(`${GROUPS_PATH}/0/members`)
        .send({
          personId: 1,
        })
        .set('Authorization', authHeader);

      expect(response.status).toBe(400);
    });

    it('should return status 404 if personId is not an existing person id', async () => {
      const postResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const response = await request
        .post(`${GROUPS_PATH}/${postResponse.body.id}/members`)
        .send({
          personId: 1,
        })
        .set('Authorization', authHeader);

      expect(response.status).toBe(404);
    });

    it('should return status 404 if group does not exist', async () => {
      const personPostResponse = await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[0])
        .set('Authorization', authHeader);

      const response = await request
        .post(`${GROUPS_PATH}/1/members`)
        .send({
          personId: personPostResponse.body.id,
        })
        .set('Authorization', authHeader);

      expect(response.status).toBe(404);
    });

    it('should return status 409 if person is already a member of the group', async () => {
      const postResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);
      const personPostResponse = await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[0])
        .set('Authorization', authHeader);

      await request
        .post(`${GROUPS_PATH}/${postResponse.body.id}/members`)
        .send({
          personId: personPostResponse.body.id,
        })
        .set('Authorization', authHeader);

      const response = await request
        .post(`${GROUPS_PATH}/${postResponse.body.id}/members`)
        .send({
          personId: personPostResponse.body.id,
        })
        .set('Authorization', authHeader);

      expect(response.status).toBe(409);
    });
  });

  describe(`PUT ${GROUPS_PATH}/:id`, () => {
    it('should return status 200', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const putResponse = await request
        .put(`${GROUPS_PATH}/${response.body.id}`)
        .send(GROUPS[1])
        .set('Authorization', authHeader);

      expect(putResponse.status).toBe(200);
    });

    it('should return updated group', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const putResponse = await request
        .put(`${GROUPS_PATH}/${response.body.id}`)
        .send(GROUPS[1])
        .set('Authorization', authHeader);

      expect(removeId(putResponse.body)).toEqual(GROUPS[1]);
    });

    it('should actually update group', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      await request
        .put(`${GROUPS_PATH}/${response.body.id}`)
        .send(GROUPS[1])
        .set('Authorization', authHeader);

      const getResponse = await request
        .get(`${GROUPS_PATH}/${response.body.id}`)
        .set('Authorization', authHeader);

      expect(removeId(getResponse.body)).toEqual(GROUPS[1]);
    });

    it('should return status 404 if group not found', async () => {
      const response = await request
        .put(`${GROUPS_PATH}/1`)
        .send(GROUPS[0])
        .set('Authorization', authHeader);
      expect(response.status).toBe(404);
    });

    it('should return status 400 if name is empty', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const putResponse = await request
        .put(`${GROUPS_PATH}/${response.body.id}`)
        .send({ name: '' })
        .set('Authorization', authHeader);

      expect(putResponse.status).toBe(400);
    });

    it('should return status 400 if name is longer than 100 characters', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const putResponse = await request
        .put(`${GROUPS_PATH}/${response.body.id}`)
        .send({
          name: 'a'.repeat(101),
        })
        .set('Authorization', authHeader);

      expect(putResponse.status).toBe(400);
    });

    it('should return status 400 if name is shorter than 3 characters', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const putResponse = await request
        .put(`${GROUPS_PATH}/${response.body.id}`)
        .send({
          name: 'aa',
        })
        .set('Authorization', authHeader);

      expect(putResponse.status).toBe(400);
    });

    it('should trim name', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const putResponse = await request
        .put(`${GROUPS_PATH}/${response.body.id}`)
        .send({
          name: '  name  ',
        })
        .set('Authorization', authHeader);

      expect(putResponse.body.name).toBe('name');
    });

    it('should return status 400 if description is longer than 500 characters', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const putResponse = await request
        .put(`${GROUPS_PATH}/${response.body.id}`)
        .send({
          description: 'a'.repeat(501),
        })
        .set('Authorization', authHeader);

      expect(putResponse.status).toBe(400);
    });

    it('should return status 400 if description is empty', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const putResponse = await request
        .put(`${GROUPS_PATH}/${response.body.id}`)
        .send({
          description: '',
        })
        .set('Authorization', authHeader);

      expect(putResponse.status).toBe(400);
    });

    it('should trim description', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const putResponse = await request
        .put(`${GROUPS_PATH}/${response.body.id}`)
        .send({
          description: '  description  ',
        })
        .set('Authorization', authHeader);

      expect(putResponse.body.description).toBe('description');
    });

    it('should return status 400 if color is empty', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const putResponse = await request
        .put(`${GROUPS_PATH}/${response.body.id}`)
        .send({
          color: '',
        })
        .set('Authorization', authHeader);

      expect(putResponse.status).toBe(400);
    });

    it('should return status 400 if color is longer than 30 characters', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const putResponse = await request
        .put(`${GROUPS_PATH}/${response.body.id}`)
        .send({
          color: 'a'.repeat(31),
        })
        .set('Authorization', authHeader);

      expect(putResponse.status).toBe(400);
    });

    it('should trim color', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const putResponse = await request
        .put(`${GROUPS_PATH}/${response.body.id}`)
        .send({
          color: '  color  ',
        })
        .set('Authorization', authHeader);

      expect(putResponse.body.color).toBe('color');
    });

    it('should return status 400 if target is empty', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const putResponse = await request
        .put(`${GROUPS_PATH}/${response.body.id}`)
        .send({
          target: '',
        })
        .set('Authorization', authHeader);

      expect(putResponse.status).toBe(400);
    });

    it('should return status 400 if target is longer than 100 characters', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const putResponse = await request
        .put(`${GROUPS_PATH}/${response.body.id}`)
        .send({
          target: 'a'.repeat(101),
        })
        .set('Authorization', authHeader);

      expect(putResponse.status).toBe(400);
    });

    it('should trim target', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const putResponse = await request
        .put(`${GROUPS_PATH}/${response.body.id}`)
        .send({
          target: '  target  ',
        })
        .set('Authorization', authHeader);

      expect(putResponse.body.target).toBe('target');
    });

    it('should return status 400 if id is not a number', async () => {
      const response = await request
        .put(`${GROUPS_PATH}/id`)
        .send(GROUPS[0])
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return status 400 if id is not an integer', async () => {
      const response = await request
        .put(`${GROUPS_PATH}/1.1`)
        .send(GROUPS[0])
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return status 400 if id is less than 1', async () => {
      const response = await request
        .put(`${GROUPS_PATH}/0`)
        .send(GROUPS[0])
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });
  });

  describe(`DELETE ${GROUPS_PATH}/:id`, () => {
    it('should return status 204 if group deleted', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const deleteResponse = await request
        .delete(`${GROUPS_PATH}/${response.body.id}`)
        .set('Authorization', authHeader);

      expect(deleteResponse.status).toBe(204);
    });

    it('should actually delete group', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      await request
        .delete(`${GROUPS_PATH}/${response.body.id}`)
        .set('Authorization', authHeader);

      const getResponse = await request
        .get(`${GROUPS_PATH}/${response.body.id}`)
        .set('Authorization', authHeader);

      expect(getResponse.status).toBe(404);
    });

    it('should also delete all group memberships', async () => {
      const groupPostResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);
      const personPostResponse = await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[0])
        .set('Authorization', authHeader);

      await request
        .post(`${GROUPS_PATH}/${groupPostResponse.body.id}/members`)
        .send({
          personId: personPostResponse.body.id,
        })
        .set('Authorization', authHeader);

      await request
        .delete(`${GROUPS_PATH}/${groupPostResponse.body.id}`)
        .set('Authorization', authHeader);

      const getResponse = await request
        .get(`${PEOPLE_PATH}/${personPostResponse.body.id}/groups`)
        .set('Authorization', authHeader);

      expect(getResponse.body).toHaveLength(0);
    });

    it('should return status 404 if group not found', async () => {
      const response = await request
        .delete(`${GROUPS_PATH}/1`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(404);
    });

    it('should return status 400 if id is not a number', async () => {
      const response = await request
        .delete(`${GROUPS_PATH}/id`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return status 400 if id is not an integer', async () => {
      const response = await request
        .delete(`${GROUPS_PATH}/1.1`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return status 400 if id is less than 1', async () => {
      const response = await request
        .delete(`${GROUPS_PATH}/0`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });
  });

  describe(`DELETE ${GROUPS_PATH}`, () => {
    it('should return status 204 if groups deleted', async () => {
      await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const deleteResponse = await request
        .delete(GROUPS_PATH)
        .set('Authorization', authHeader);

      expect(deleteResponse.status).toBe(204);
    });

    it('should actually delete groups', async () => {
      const response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      await request.delete(GROUPS_PATH).set('Authorization', authHeader);

      const getResponse = await request
        .get(`${GROUPS_PATH}/${response.body.id}`)
        .set('Authorization', authHeader);

      expect(getResponse.status).toBe(404);
    });

    it('should also delete all group memberships', async () => {
      const groupPostResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);
      const groupPost2Response = await request
        .post(GROUPS_PATH)
        .send(GROUPS[1])
        .set('Authorization', authHeader);
      const personPostResponse = await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[0])
        .set('Authorization', authHeader);
      const personPost2Response = await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[1])
        .set('Authorization', authHeader);
      const personPost3Response = await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[2])
        .set('Authorization', authHeader);
      const personPost4Response = await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[3])
        .set('Authorization', authHeader);

      await request
        .post(`${GROUPS_PATH}/${groupPostResponse.body.id}/members`)
        .send({
          personId: personPostResponse.body.id,
        })
        .set('Authorization', authHeader);

      await request
        .post(`${GROUPS_PATH}/${groupPostResponse.body.id}/members`)
        .send({
          personId: personPost2Response.body.id,
        })
        .set('Authorization', authHeader);
      await request
        .post(`${GROUPS_PATH}/${groupPost2Response.body.id}/members`)
        .send({
          personId: personPost3Response.body.id,
        })
        .set('Authorization', authHeader);
      await request
        .post(`${GROUPS_PATH}/${groupPost2Response.body.id}/members`)
        .send({
          personId: personPost4Response.body.id,
        })
        .set('Authorization', authHeader);

      await request.delete(GROUPS_PATH).set('Authorization', authHeader);

      const getResponse1 = await request
        .get(`${PEOPLE_PATH}/${personPostResponse.body.id}/groups`)
        .set('Authorization', authHeader);
      const getResponse2 = await request
        .get(`${PEOPLE_PATH}/${personPost2Response.body.id}/groups`)
        .set('Authorization', authHeader);
      const getResponse3 = await request
        .get(`${PEOPLE_PATH}/${personPost3Response.body.id}/groups`)
        .set('Authorization', authHeader);
      const getResponse4 = await request
        .get(`${PEOPLE_PATH}/${personPost4Response.body.id}/groups`)
        .set('Authorization', authHeader);

      expect(getResponse1.body).toHaveLength(0);
      expect(getResponse2.body).toHaveLength(0);
      expect(getResponse3.body).toHaveLength(0);
      expect(getResponse4.body).toHaveLength(0);
    });
  });

  describe(`DELETE ${GROUPS_PATH}/:id/members/:personId`, () => {
    it('should return status 204 if group membership deleted', async () => {
      const groupPostResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);
      const personPostResponse = await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[0])
        .set('Authorization', authHeader);

      await request
        .post(`${GROUPS_PATH}/${groupPostResponse.body.id}/members`)
        .send({
          personId: personPostResponse.body.id,
        })
        .set('Authorization', authHeader);

      const deleteResponse = await request
        .delete(
          `${GROUPS_PATH}/${groupPostResponse.body.id}/members/${personPostResponse.body.id}`
        )
        .set('Authorization', authHeader);

      expect(deleteResponse.status).toBe(204);
    });

    it('should actually delete group membership', async () => {
      const groupPostResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);
      const personPostResponse = await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[0])
        .set('Authorization', authHeader);

      await request
        .post(`${GROUPS_PATH}/${groupPostResponse.body.id}/members`)
        .send({
          personId: personPostResponse.body.id,
        })
        .set('Authorization', authHeader);

      await request
        .delete(
          `${GROUPS_PATH}/${groupPostResponse.body.id}/members/${personPostResponse.body.id}`
        )
        .set('Authorization', authHeader);

      const getResponse = await request
        .get(`${PEOPLE_PATH}/${personPostResponse.body.id}/groups`)
        .set('Authorization', authHeader);

      expect(getResponse.body).toHaveLength(0);
    });

    it('should return status 404 if group not found', async () => {
      const personPostResponse = await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[0])
        .set('Authorization', authHeader);

      const response = await request
        .delete(`${GROUPS_PATH}/1/members/${personPostResponse.body.id}`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(404);
    });

    it('should return status 404 if person not found', async () => {
      const groupPostResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);

      const response = await request
        .delete(`${GROUPS_PATH}/${groupPostResponse.body.id}/members/1`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(404);
    });

    it('should return status 400 if id is not a number', async () => {
      const groupPostResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);
      await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[0])
        .set('Authorization', authHeader);

      const response = await request
        .delete(`${GROUPS_PATH}/${groupPostResponse.body.id}/members/id`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return status 400 if id is less than 1', async () => {
      const groupPostResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);
      await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[0])
        .set('Authorization', authHeader);

      const response = await request
        .delete(`${GROUPS_PATH}/${groupPostResponse.body.id}/members/0`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return status 400 if personId is not a number', async () => {
      const groupPostResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);
      await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[0])
        .set('Authorization', authHeader);

      const response = await request
        .delete(`${GROUPS_PATH}/${groupPostResponse.body.id}/members/id`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return status 400 if personId is less than 1', async () => {
      const groupPostResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);
      await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[0])
        .set('Authorization', authHeader);

      const response = await request
        .delete(`${GROUPS_PATH}/${groupPostResponse.body.id}/members/0`)
        .set('Authorization', authHeader);
      expect(response.status).toBe(400);
    });

    it('should return status 404 if group membership not found', async () => {
      const groupPostResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);
      const personPostResponse = await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[0])
        .set('Authorization', authHeader);

      const response = await request
        .delete(
          `${GROUPS_PATH}/${groupPostResponse.body.id}/members/${personPostResponse.body.id}`
        )
        .set('Authorization', authHeader);
      expect(response.status).toBe(404);
    });
  });

  describe(`DELETE ${GROUPS_PATH}/:id/members`, () => {
    it('should return status 204 if group membership deleted', async () => {
      const groupPostResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);
      const personPostResponse = await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[0])
        .set('Authorization', authHeader);

      await request
        .post(`${GROUPS_PATH}/${groupPostResponse.body.id}/members`)
        .send({
          personId: personPostResponse.body.id,
        })
        .set('Authorization', authHeader);

      const deleteResponse = await request
        .delete(`${GROUPS_PATH}/${groupPostResponse.body.id}/members`)
        .set('Authorization', authHeader);

      expect(deleteResponse.status).toBe(204);
    });

    it('should actually delete all group memberships', async () => {
      const groupPostResponse = await request
        .post(GROUPS_PATH)
        .send(GROUPS[0])
        .set('Authorization', authHeader);
      const personPost1Response = await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[0])
        .set('Authorization', authHeader);
      const personPost2Response = await request
        .post(PEOPLE_PATH)
        .send(PEOPLE[1])
        .set('Authorization', authHeader);

      await request
        .post(`${GROUPS_PATH}/${groupPostResponse.body.id}/members`)
        .send({
          personId: personPost1Response.body.id,
        })
        .set('Authorization', authHeader);
      await request
        .post(`${GROUPS_PATH}/${groupPostResponse.body.id}/members`)
        .send({
          personId: personPost2Response.body.id,
        })
        .set('Authorization', authHeader);

      await request
        .delete(`${GROUPS_PATH}/${groupPostResponse.body.id}/members`)
        .set('Authorization', authHeader);

      const getResponse = await request
        .get(`${GROUPS_PATH}/${groupPostResponse.body.id}/members`)
        .set('Authorization', authHeader);

      expect(getResponse.body).toHaveLength(0);

      const getResponse1 = await request
        .get(`${PEOPLE_PATH}/${personPost1Response.body.id}/groups`)
        .set('Authorization', authHeader);
      const getResponse2 = await request
        .get(`${PEOPLE_PATH}/${personPost2Response.body.id}/groups`)
        .set('Authorization', authHeader);

      expect(getResponse1.body).toHaveLength(0);
      expect(getResponse2.body).toHaveLength(0);
    });
  });
});
