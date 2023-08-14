export type PersonData = {
  name: string;
  email?: string;
  bio?: string;
  studiesOrJobs?: string;
  birthDate?: Date;
  phoneNumber?: string;
};

export type StringifiedPersonData = {
  name: string;
  email?: string;
  bio?: string;
  studiesOrJobs?: string;
  birthDate?: string;
  phoneNumber?: string;
};

export type Person = PersonData & {
  id: number;
};
