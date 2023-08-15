/* eslint-disable import/no-extraneous-dependencies */
import { describe, it, expect, beforeEach } from 'vitest';
import { Person } from '@prisma/client';
import PersonService from '../../service/person.js';
import PersonSeeder from '../../seeders/person.js';
import CustomPrismaClient from '../../core/CustomPrismaClient.js';
import CustomLogger from '../../core/CustomLogger.js';

const testLogger = new CustomLogger('PersonServiceTest');
const prismaClient = new CustomPrismaClient(testLogger);
const personService = new PersonService(prismaClient);

beforeEach(async () => {
  await personService.deleteAll();
});

describe('personService', () => {
  describe('getAll', () => {
    it('should return all persons', async () => {
      const persons = [
        PersonSeeder.generatePerson(),
        PersonSeeder.generatePerson(),
      ];

      await personService.createMany(persons);

      const result = await personService.getAll();

      expect(result).toHaveLength(2);
    });

    it('should give 0 persons', async () => {
      const result = await personService.getAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('getById', () => {
    it('should return a person', async () => {
      const person = PersonSeeder.generatePerson();

      const generatedPerson = await personService.create(person);

      const result = await personService.getById(generatedPerson.id);

      expect(result).toEqual(generatedPerson);
    });

    it('should return null', async () => {
      const result = await personService.getById(1);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should return the created person with id', async () => {
      const person = PersonSeeder.generatePerson();

      const result = await personService.create(person);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name', person.name);
      expect(result).toHaveProperty('email', person.email);
      expect(result).toHaveProperty('phoneNumber', person.phoneNumber);
      expect(result).toHaveProperty('bio', person.bio);
      expect(result).toHaveProperty('studiesOrJob', person.studiesOrJob);
      expect(result).toHaveProperty('birthdate', person.birthdate);
    });
  });

  describe('createMany', () => {
    it('should return the created persons with id', async () => {
      const persons = [
        PersonSeeder.generatePerson(),
        PersonSeeder.generatePerson(),
      ];

      const result = await personService.createMany(persons);

      expect(result).toHaveLength(2);
      const person1 = result[0] as Person;
      const person2 = result[1] as Person;

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name', person1.name);
      expect(result[0]).toHaveProperty('email', person1.email);
      expect(result[0]).toHaveProperty('phoneNumber', person1.phoneNumber);
      expect(result[0]).toHaveProperty('bio', person1.bio);
      expect(result[0]).toHaveProperty('studiesOrJob', person1.studiesOrJob);
      expect(result[0]).toHaveProperty('birthdate', person1.birthdate);
      expect(result[1]).toHaveProperty('id');
      expect(result[1]).toHaveProperty('name', person2.name);
      expect(result[1]).toHaveProperty('email', person2.email);
      expect(result[1]).toHaveProperty('phoneNumber', person2.phoneNumber);
      expect(result[1]).toHaveProperty('bio', person2.bio);
      expect(result[1]).toHaveProperty('studiesOrJob', person2.studiesOrJob);
      expect(result[1]).toHaveProperty('birthdate', person2.birthdate);
    });

    it('should return empty when given empty array', async () => {
      const result = await personService.createMany([]);

      expect(result).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should return the updated person', async () => {
      const person = PersonSeeder.generatePerson();

      const generatedPerson = await personService.create(person);

      const updatedPerson = {
        ...generatedPerson,
        name: 'Updated name',
        email: 'Updated email',
        phoneNumber: 'Updated phone number',
        bio: 'Updated bio',
        studiesOrJob: 'Updated studies or job',
        birthdate: new Date(),
      };

      const result = await personService.update(
        generatedPerson.id,
        updatedPerson
      );

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name', updatedPerson.name);
      expect(result).toHaveProperty('email', updatedPerson.email);
      expect(result).toHaveProperty('phoneNumber', updatedPerson.phoneNumber);
      expect(result).toHaveProperty('bio', updatedPerson.bio);
      expect(result).toHaveProperty('studiesOrJob', updatedPerson.studiesOrJob);
      expect(result).toHaveProperty('birthdate', updatedPerson.birthdate);
    });

    it('should return null when given wrong id', async () => {
      const person = PersonSeeder.generatePerson();

      const updatedPerson = await personService.update(1, person);

      expect(updatedPerson).toBeNull();
    });

    it('can also just update one field', async () => {
      const person = PersonSeeder.generatePerson();

      const generatedPerson = await personService.create(person);

      const updatedPerson = {
        ...generatedPerson,
        name: 'Updated name',
      };

      const result = await personService.update(
        generatedPerson.id,
        updatedPerson
      );

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name', updatedPerson.name);
      expect(result).toHaveProperty('email', person.email);
      expect(result).toHaveProperty('phoneNumber', person.phoneNumber);
      expect(result).toHaveProperty('bio', person.bio);
      expect(result).toHaveProperty('studiesOrJob', person.studiesOrJob);
      expect(result).toHaveProperty('birthdate', person.birthdate);
    });
  });

  describe('delete', () => {
    it('should return true when given correct id', async () => {
      const person = PersonSeeder.generatePerson();

      const generatedPerson = await personService.create(person);

      const result = await personService.delete(generatedPerson.id);

      expect(result).toBe(true);
    });

    it('should return false when given wrong id', async () => {
      const result = await personService.delete(1);
      expect(result).toBe(false);
    });

    it('should actually remove the person from the database', async () => {
      const person = PersonSeeder.generatePerson();

      const generatedPerson = await personService.create(person);

      await personService.delete(generatedPerson.id);

      const personInDb = await personService.getById(generatedPerson.id);

      expect(personInDb).toBeNull();
    });
  });

  describe('deleteMany', () => {
    it('should return the amount of deleted persons', async () => {
      const persons = [
        PersonSeeder.generatePerson(),
        PersonSeeder.generatePerson(),
      ];

      const generatedPersons = await personService.createMany(persons);
      const ids = generatedPersons.map((p) => p.id);

      const result = await personService.deleteMany(ids);

      expect(result).toBe(ids.length);
    });

    it('should return 0 when given empty array', async () => {
      const result = await personService.deleteMany([]);

      expect(result).toBe(0);
    });

    it('should actually remove the persons from the database', async () => {
      const persons = [
        PersonSeeder.generatePerson(),
        PersonSeeder.generatePerson(),
      ];

      const generatedPersons = await personService.createMany(persons);
      const ids = generatedPersons.map((p) => p.id);

      await personService.deleteMany(ids);

      const remainingPeople = await personService.getAll();

      expect(remainingPeople).toHaveLength(0);
    });

    it('should return the amount of deleted persons when given wrong ids', async () => {
      const result = await personService.deleteMany([1, 2, 3]);

      expect(result).toBe(0);
    });

    it('should return the amount of deleted persons when given some wrong ids', async () => {
      const persons = [
        PersonSeeder.generatePerson(),
        PersonSeeder.generatePerson(),
      ];

      const generatedPersons = await personService.createMany(persons);
      const ids = generatedPersons.map((p) => p.id);

      const result = await personService.deleteMany([-1, -2, ...ids]);

      expect(result).toBe(ids.length);
    });

    it('should be able to handle the case where some ids are the same', async () => {
      const persons = [
        PersonSeeder.generatePerson(),
        PersonSeeder.generatePerson(),
      ];

      const generatedPersons = await personService.createMany(persons);
      const ids = generatedPersons.map((p) => p.id);

      const result = await personService.deleteMany([...ids, ...ids]);

      expect(result).toBe(ids.length);
    });
  });

  describe('deleteAll', () => {
    it('should return the amount of deleted persons', async () => {
      const persons = [
        PersonSeeder.generatePerson(),
        PersonSeeder.generatePerson(),
      ];

      await personService.createMany(persons);

      const result = await personService.deleteAll();

      expect(result).toEqual(persons.length);
    });

    it('should return empty when no persons', async () => {
      const result = await personService.deleteAll();

      expect(result).toEqual(0);
    });

    it('should actually remove the persons from the database', async () => {
      const persons = [
        PersonSeeder.generatePerson(),
        PersonSeeder.generatePerson(),
      ];

      await personService.createMany(persons);

      await personService.deleteAll();

      const remainingPeople = await personService.getAll();

      expect(remainingPeople).toHaveLength(0);
    });
  });

  describe('count', () => {
    it('should return the amount of persons', async () => {
      const persons = [
        PersonSeeder.generatePerson(),
        PersonSeeder.generatePerson(),
      ];

      await personService.createMany(persons);

      const result = await personService.count();

      expect(result).toBe(2);
    });

    it('should return 0 when no persons', async () => {
      const result = await personService.count();

      expect(result).toBe(0);
    });
  });
});
