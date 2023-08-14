import Group, { Sex } from 'typings/Group.js';
import { Person } from 'typings/Person.js';

export const PEOPLE: Person[] = [
  {
    id: 1,
    name: 'Benjamin',
    email: 'benjamin@gmail.com',
    bio: 'I am a software engineer.',
    studiesOrJobs: 'Software Engineer',
    birthDate: new Date('1990-01-01'),
    phoneNumber: '123456789',
  },
  {
    id: 2,
    name: 'John',
    email: 'john@gmail.com',
    bio: 'I am a software engineer.',
    studiesOrJobs: 'Software Engineer',
    birthDate: new Date('1990-01-01'),
    phoneNumber: '123456789',
  },
  {
    id: 3,
    name: 'Jane',
    email: 'jane@gmail.com',
    bio: 'I am a software engineer.',
    studiesOrJobs: 'Software Engineer',
    birthDate: new Date('1990-01-01'),
    phoneNumber: '123456789',
  },
];

export const GROUPS: Group[] = [
  {
    id: 1,
    name: 'Group 1',
    description: 'This is group 1',
    color: 'red',
    ageRange: '18-25',
  },
  {
    id: 2,
    name: 'Group 2',
    description: 'This is group 2',
    color: 'blue',
    ageRange: '18-25',
  },
  {
    id: 3,
    name: 'Group 3',
    description: 'This is group 3',
    color: 'green',
    ageRange: '18-25',
    sex: Sex.FEMALE,
  },
];

export const MEMBERSHIPS = [
  {
    id: 1,
    personId: 1,
    groupId: 1,
  },
  {
    id: 2,
    personId: 2,
    groupId: 1,
  },
  {
    id: 3,
    personId: 3,
    groupId: 1,
  },
  {
    id: 4,
    personId: 1,
    groupId: 2,
  },
  {
    id: 5,
    personId: 2,
    groupId: 2,
  },
];
