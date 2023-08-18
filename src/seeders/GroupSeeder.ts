import { faker } from '@faker-js/faker';
import { Group } from '@prisma/client';
import config from 'config';
import GroupService from '../service/GroupService.js';

const GROUPS = [
  {
    name: 'Ribbels',
    description:
      'De ribbels behoren tot de jongste afdeling van onze Chiro. Vanaf 6 jaar verwelkomen wij hen en ze blijven tot hun 8 jaar deelnemen aan de activiteiten bij de Ribbels.',
    color: 'paars',
    target: '1-2 leerjaar',
  },
  {
    name: 'Speelclub',
    description:
      'Wanneer deze jonge deugnieten de leeftijd van 8 jaar bereikt hebben komen ze bij de Speelclub terecht. Hier staat fantasie centraal. Spelletjes worden speciaal ingekleed en er wordt veel rond een thema gewerkt.',
    color: 'geel',
    target: '3-4 leerjaar',
  },
  {
    name: "Rakwi's",
    description:
      "Bij de Rakwi's zijn actieve spelletjes schering en inslag. Deze bengels zullen dan ook na een middagje Chiro moe maar voldaan de zetel inploffen!",
    color: 'groen',
    target: '5-6 leerjaar',
  },
  {
    name: "Tito's",
    description:
      "Deze jonge garde kan al eens een spelletje 'outside the box' aan maar houdt toch nog van actief ravotten. Een gevarieerd programma tijdens een Chirozondag peuzelen deze Tito's dan ook op als zoete broodjes!",
    color: 'rood',
    target: '1-2 middelbaar',
  },
  {
    name: "Keti's",
    description:
      'De op-een-na oudste groep van de Chiro. Deze dames en heren houden dan ook al meer van een spelletje waar iets meer bij moet nagedacht worden, maar blijken wanneer de nood het hoogst is toch nog in staat de jonge veulens te spelen die ze toch wel zijn!',
    color: 'blauw',
    target: '3-4 middelbaar',
  },
  {
    name: "Aspi's",
    description:
      'De oudste Chirogroep. Bij deze groep staat samenhang en vriendschap centraal. In groep een evenement organiseren, een midweek bijwonen, etc... Deze jongens en meisjes worden meestal na hun Aspirantenperiode opgenomen in de Leidersploeg.',
    color: 'oranje',
    target: '5de middelbaar',
  },
];

class GroupSeeder {
  private readonly service: GroupService;

  public static readonly shouldUseFakeData = config.get('database.seedFake');

  constructor(service: GroupService) {
    this.service = service;
  }

  public static generate(): Omit<Group, 'id'> {
    return {
      name: faker.lorem.words(3),
      description: faker.lorem.words(10),
      color: faker.color.human(),
      target: faker.lorem.words(3),
    };
  }

  async run(): Promise<Group[]> {
    if (GroupSeeder.shouldUseFakeData) {
      return Promise.all(
        Array.from({ length: 6 }).map(() =>
          this.service.create(GroupSeeder.generate())
        )
      );
    }
    return this.service.createMany(GROUPS);
  }

  // private add(): Promise<Group> {
  //   return this.service.create(GroupSeeder.generate());
  // }

  // async run(): Promise<Group[]> {
  //   const promises = Array.from({ length: 10 }).map(() => this.add());
  //   return Promise.all(promises);
  // }
}

export default GroupSeeder;

// import { faker } from '@faker-js/faker';
// import { Group } from '@prisma/client';
// import config from 'config';
// import GroupService from '../service/GroupService.js';

// class GroupSeeder {
//   private readonly service: GroupService;

//   public static readonly shouldUseFakeData = config.get('database.seedFake');

//   constructor(service: GroupService) {
//     this.service = service;
//   }

//   public static generate(): Omit<Group, 'id'> {
//     return {
//       name: faker.lorem.words(3),
//       description: faker.lorem.words(10),
//       color: faker.color.human(),
//       target: faker.lorem.words(3),
//     };
//   }

//   public static generateMany(): Omit<Group, 'id'>[] {
//     if (this.shouldUseFakeData) {
//       return Array.from({ length: 6 }).map(() => this.generate());
//     }
//     return [
//       {
//         name: 'Ribbels',
//         description:
//           'De ribbels behoren tot de jongste afdeling van onze Chiro. Vanaf 6 jaar verwelkomen wij hen en ze blijven tot hun 8 jaar deelnemen aan de activiteiten bij de Ribbels.',
//         color: 'Paars',
//         target: '1-2 leerjaar',
//       },
//       {
//         name: 'Speelclub',
//         description:
//           'Wanneer deze jonge deugnieten de leeftijd van 8 jaar bereikt hebben komen ze bij de Speelclub terecht. Hier staat fantasie centraal. Spelletjes worden speciaal ingekleed en er wordt veel rond een thema gewerkt.',
//         color: 'Geel',
//         target: '3-4 leerjaar',
//       },
//       {
//         name: 'Rakwi',
//         description:
//           "Bij de Rakwi's zijn actieve spelletjes schering en inslag. Deze bengels zullen dan ook na een middagje Chiro moe maar voldaan de zetel inploffen!",
//         color: 'Groen',
//         target: '5-6 leerjaar',
//       },
//       {
//         name: 'Tito',
//         description:
//           "Deze jonge garde kan al eens een spelletje 'outside the box' aan maar houdt toch nog van actief ravotten. Een gevarieerd programma tijdens een Chirozondag peuzelen deze Tito's dan ook op als zoete broodjes!",
//         color: 'rood',
//         target: '1-2 middelbaar',
//       },
//       {
//         name: 'Keti',
//         description:
//           'De op-een-na oudste groep van de Chiro. Deze dames en heren houden dan ook al meer van een spelletje waar iets meer bij moet nagedacht worden, maar blijken wanneer de nood het hoogst is toch nog in staat de jonge veulens te spelen die ze toch wel zijn!',
//         color: 'blauw',
//         target: '3-4 middelbaar',
//       },
//       {
//         name: 'Aspi',
//         description:
//           'De oudste Chirogroep. Bij deze groep staat samenhang en vriendschap centraal. In groep een evenement organiseren, een midweek bijwonen, etc... Deze jongens en meisjes worden meestal na hun Aspirantenperiode opgenomen in de Leidersploeg.',
//         color: 'oranje',
//         target: '5de middelbaar',
//       },
//     ];
//   }

//   async run(): Promise<Group[]> {
//     const groups = GroupSeeder.generateMany();
//     return this.service.createMany(groups);
//   }
// }

// export default GroupSeeder;
