# Lars Salembier (202293794)

- [x] Web Services
  - [GitHub repository](https://github.com/Web-IV/2223-webservices-LarsSalembier)
  - [Online versie](github.com/HOGENT-Web)

## Projectbeschrijving

Dit is een backend voor de website van mijn jeugdbeweging. Dit is een RESTful API die de data van de website beheert. De API is geschreven in NodeJS met Koa, Prisma en SQLite.

Routes en hun toegelaten methodes:

- /api/people
  - GET: geeft alle personen terug
  - POST: voegt een persoon toe
  - DELETE: verwijdert alle personen
- /api/people/:id
  - GET: geeft een persoon terug
  - PUT: wijzigt een persoon
  - DELETE: verwijdert een persoon
- /api/people/:id/groups
  - GET: geeft alle groepen van een persoon terug
  - POST: voegt een groep toe aan een persoon
  - DELETE: verwijdert alle groepen van een persoon
- /api/people/:id/groups/:id
  - DELETE: verwijdert een persoon uit een groep (maar verwijdert de groep niet)
- /api/groups
  - GET: geeft alle groepen terug
  - POST: voegt een groep toe
  - DELETE: verwijdert alle groepen
- /api/groups/:id
  - GET: geeft een groep terug
  - PUT: wijzigt een groep
  - DELETE: verwijdert een groep
- /api/groups/:id/members
  - GET: geeft alle leden van een groep terug
  - POST: voegt een lid toe aan een groep
  - DELETE: verwijdert alle leden van een groep
- /api/groups/:id/members/:id
  - DELETE: verwijdert een lid uit een groep (maar verwijdert die persoon niet)
- /api/administrators
  - GET: geeft alle administrators terug
  - POST: voegt een administrator toe
  - DELETE: verwijdert alle administrators
- /api/administrators/:id
  - GET: geeft een administrator terug
  - PUT: wijzigt een administrator
  - DELETE: verwijdert een administrator

## Screenshots

> Voeg enkele (nuttige!) screenshots toe die tonen wat de app doet.

## Behaalde minimumvereisten

### Web Services

- **datalaag**

  - [x] voldoende complex (meer dan één tabel)
  - [x] één module beheert de connectie + connectie wordt gesloten bij sluiten server
  - [x] heeft migraties
  - [x] heeft seeds

- **repositorylaag**

  - [x] definieert één repository per entiteit (niet voor tussentabellen) - indien van toepassing
  - [x] mapt OO-rijke data naar relationele tabellen en vice versa

- **servicelaag met een zekere complexiteit**

  - [x] bevat alle domeinlogica
  - [x] bevat geen SQL-queries of databank-gerelateerde code

- **REST-laag**

  - [x] meerdere routes met invoervalidatie
  - [x] degelijke foutboodschappen
  - [x] volgt de conventies van een RESTful API
  - [x] bevat geen domeinlogica
  - [ ] degelijke authorisatie/authenticatie op alle routes

- **varia**
  - [x] een aantal niet-triviale testen (min. 1 controller >=80% coverage)
  - [x] minstens één extra technologie
  - [x] duidelijke en volledige `README.md`
  - [x] maakt gebruik van de laatste ES6-features (object destructuring, spread operator...)
  - [x] volledig en tijdig ingediend dossier

## Projectstructuur

### Web Services

Alle databankgerelateerde data zit in het mapje `prisma` (inclusief gegenereerde migraties (dit doet Prisma voor jou)). Hier vind je ook het `schema.prisma`-bestand terug, waarin de structuur van de databank gedefinieerd staat.

In `src` vinden we vervolgens volgende items terug:

- `core`: bevat de hoofdcomponenten van het programma
  - `Auth.ts`: bevat alle authenticatie-gerelateerde code
  - `CorsManager.ts`: bevat alle code die de CORS-instellingen beheert
  - `CustomLogger.ts`: bevat geconfigureerde `winston`-logger.
  - `CustomPrismaClient.ts`: bevat een geconfigureerde `PrismaClient`
  - `ErrorHandler.ts`: bevat een errorhandler die de errors opvangt en een duidelijke boodschap teruggeeft
  - `RequestLogger.ts`: bevat een logger die alle requests logt
  - `Server.ts`: bevat de server, het hoofdcomponent van het programma. Deze klasse configureert alles en bevat een `start`- en `stop`-methode.
- `repository`: bevat alle repositories en gerelateerde klassen
- `router`: bevat alle routers en gerelateerde klassen
- `service`: bevat alle services en gerelateerde klassen
- `seeders`: bevat alle seeders en gerelateerde klassen
- `validation`: bevat alle validatieschema's en gerelateerde klassen
- `index.ts`: startpunt van de applicatie. Bouwt een server en start deze (en sluit deze ook weer af bij het stoppen van de applicatie).

## Extra technologie

### Web Services

#### Typescript

[Typescript](https://www.npmjs.com/package/typescript) is een superset van Javascript die Javascript type-safe maakt. Ik heb hiervoor gekozen omdat ik bij de vorige poging code had met heel veel errors die konden vermeden worden als ik binnen type-constraints zou moeten blijven.

#### Prisma

[Prisma](https://www.npmjs.com/package/prisma) is een ORM die het mogelijk maakt om een databank te beheren zonder SQL te moeten schrijven. Ik heb hiervoor gekozen omdat ik deze technologie wou leren. Ik vind dat het een heel krachtige tool is die het mogelijk maakt om heel snel een databank op te zetten en te beheren. De gegenereerde migraties en types hebben de ontwikkeling van de applicatie ook heel wat versneld.

#### ESLint

[ESLint](https://www.npmjs.com/package/eslint/) is een linter die je code analyseert en je waarschuwt voor mogelijke fouten.

Ik heb de configuratie van Airbnb ([eslint-config-airbnb-base-typescript-prettier](https://www.npmjs.com/package/eslint-config-airbnb-base-typescript-prettier)) gebruikt hierbij omdat deze zeer populair leek en de regels die deze gebruikt mij ook wel aanstonden. Daarnaast heb ik ook nog een aantal regels toegevoegd die ik zelf belangrijk vond.

#### Prettier

[Prettier](https://www.npmjs.com/package/prettier) is een formatter die je code formatteert volgens een bepaalde stijl.

Ik vind het belangrijk dat de code die ik schrijf er consistent uitziet en dat ik niet moet nadenken over hoe ik mijn code moet formatteren. Daarom heb ik ervoor gekozen om Prettier te gebruiken. Samen met de VSCode-extensie [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) was deze tool zeer handig.

#### Vitest

[Vitest](https://www.npmjs.com/package/vitest) is een testrunner die specifiek gemaakt is voor Typescript en sneller is dan Jest.

Voor de frontent heb ik Vite gebruikt en ik wou ook graag een testrunner die hiermee compatibel was. Omdat ik toch al deze testrunner kende, heb ik deze ook gebruikt voor de backend.

Wanneer je de tests draait, zal je merken dat er 246 integratietests zijn. Deze tests zijn zeer snel uitgevoerd dankzij Vitest.

#### Faker.js

[Faker.js](https://www.npmjs.com/package/@faker-js/faker) is een library die je toelaat om fake data te genereren.

Voor de testen en voor de seeders heb ik deze library gebruikt om fake data te genereren. Zo moest ik niet al te veel tijd spenderen aan het genereren van deze data. Daarbovenop is de data die gegenereerd wordt ook nog eens zeer realistisch.

## Testresultaten

### Web Services

Er zijn 246 integratietesten geschreven over alle routes. Alle testen slagen.

Na het draaien van `yarn test:coverage` krijg je volgende resultaten:

![image](https://i.gyazo.com/556baaf59e37bc17d0e6050800bd4ebe.png)

Je ziet dat er een algemene test coverage is van 78%.

De meeste bestanden zitten boven de 80% coverage. Er zijn echter enkele uitzonderingen:

- de seeders: voor seeding heb ik geen testen geschreven.
- `Auth.ts`: de authenticatiecode zelf wordt weinig tot niet getest.

## Gekende bugs

### Web Services

Geen gekende bugs. Alle testen slagen en de applicatie werkt zoals verwacht.
