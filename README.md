# Examenopdracht Web Services

- Student: Lars Salembier
- Studentennummer: 202293794
- E-mailadres: lars.salembier@student.hogent.be

## Vereisten

Ik verwacht dat volgende software reeds geïnstalleerd is:

- [NodeJS](https://nodejs.org)
- [Yarn](https://yarnpkg.com)

## Opstarten

### `.env`-bestanden

Om deze API te starten heb je `.env`-bestanden nodig, meerbepaald 3:

- `.env.development`: voor development
- `.env.test`: voor testen
- `.env.production`: voor production

Maak deze 3 bestanden aan en plaats in alle 3 de volgende regels:

```
AUTH_JWKS_URI='https://voorbeeld.eu.auth0.com/.well-known/jwks.json'
AUTH_AUDIENCE='https://api.voorbeeld.be'
AUTH_ISSUER='https://voorbeeld.eu.auth0.com/'
AUTH_USER_INFO='https://voorbeeld.eu.auth0.com/userinfo'
```

Uiteraard vervang je de urls hier door de juiste urls voor jouw Auth0-applicatie

Eventueel kun je nog de port aanpassen in de `.env`-bestanden, op deze manier:

De standaardpoort is 9000.

Nu voegen we de volgende specifieke regels toe:

Aan `.env.development` voegen we toe:

```
NODE_ENV=development
DATABASE_URL="file:./development.db"
```

Aan `.env.production` voegen we toe:

```
NODE_ENV=production
DATABASE_URL="file:./production.db"
```

En aan `.env.test` voegen we toe:

```
NODE_ENV=test
DATABASE_URL="file:./test.db"

AUTH_TEST_USER_USER_ID='awdaad456wd46awd456awd645daw'
AUTH_TEST_USER_USERNAME='user@database.be'
AUTH_TEST_USER_PASSWORD='Wachtwoord123'
AUTH_TOKEN_URL='https://voorbeeld.eu.auth0.com/oauth/token'
AUTH_CLIENT_ID='WDNWDAN:WDN:n;DJNLAwadlnanlDLNWa:LND:N'
AUTH_CLIENT_SECRET='ADWWADKNADWDAJLWNADWJNLLNAWD:KLNWD:KLNAWD:NLKAWD:KLNAWD:KLNAWD:KL'
```

Alle `AUTH`-waarden hierboven zijn voorbeelden, uiteraard voeg je je eigen waarden toe.

Wanneer de poort verschilt van de standaardwaarde 9000, kan je de `.env`-bestanden ook uitbreiden met de volgende configuratie:

```
PORT=4500
```

### Database bouwen

Voordat je de database bouwt, moet je zeker de `.env`-bestanden hebben aangemaakt (zie hierboven).

- Bouw de development-database: `yarn setup:dev`

- Bouw de production-database: `yarn setup:prod`

- Bouw de test-database: `yarn setup:test`

### App starten

Voordat je de app draait, moet je zeker de database bouwen (zie hierboven).

- Start de app in development-modus met het commando `yarn start:dev`.

- Start de app in production-modus met het commando `yarn start:prod`.

## Testen

Voordat je de testen draait, moet je eerst de testdatabase bouwen: `yarn setup:test`. Zorg er ook voor dat je de `.env.test`-file hebt aangemaakt (zie hierboven).

Voer de testen uit met `yarn test`. Om coverage te krijgen voer je `yarn test:coverage` uit.

## Veelvoorkomende errors

- 'Modules not found'-errors: probeer het commando `yarn install` of simpelweg `yarn` uit te voeren.

- Problemen met de databank (onverwachte errors vanaf Prisma): probeer de databank opnieuw te bouwen met `yarn setup:dev`, `yarn setup:prod` of `yarn setup:test` (afhankelijk van welke databank je nodig hebt).
