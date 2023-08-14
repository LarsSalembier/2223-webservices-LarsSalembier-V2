export enum Sex {
  MALE = 'male',
  FEMALE = 'female',
}

type Group = {
  id: number;
  name: string;
  description: string;
  color?: string;
  ageRange?: string;
  sex?: Sex;
};

export default Group;
