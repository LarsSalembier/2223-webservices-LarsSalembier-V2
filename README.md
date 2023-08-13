# Examenopdracht Web Services

- Student: Lars Salembier
- Studentennummer: 202293794
- E-mailadres: lars.salembier@student.hogent.be

## Vereisten

Ik verwacht dat volgende software reeds geïnstalleerd is:

- [NodeJS](https://nodejs.org)
- [Yarn](https://yarnpkg.com)
- [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)

## Opstarten

### `.env`-bestand

Om deze API te starten maak je een `.env` bestand aan in de root van deze directory met de volgende inhoud:

```
NODE_ENV="development"
DATABASE_USERNAME="root"
DATABASE_PASSWORD=""
```

Vervang de waarden van de variabelen `DATABASE_USERNAME` en `DATABASE_PASSWORD` door de gebruikersnaam en het wachtwoord van je lokale database.

Wanneer de database host of poort verschillen van onze standaardwaarden, kan je het `.env`-bestand ook uitbreiden met de volgende configuraties:

```
DATABASE_HOST="localhost"
DATABASE_PORT=3306
```

### App starten

Start de app in development-modus met het commando `yarn start`.

Start de app in production-modus met het commando `yarn start:prod`. We gaan er dan vanuit dat alle nodige omgevingsvariabelen zijn ingevuld, er wordt geen `.env`-bestand gelezen met dit commando.

## Testen

Maak een `.env.test` met een gelijkaardige configuratie als hierboven (gebruik een andere database).

Voer de testen uit met `yarn test`. Om coverage te krijgen voer je `yarn test:coverage` uit.

## Veelvoorkomende errors

- 'Modules not found'-errors: probeer het commando `yarn install`.
- Migrations failed: probeer de bestaande `chirosite` database te droppen en probeer opnieuw.
