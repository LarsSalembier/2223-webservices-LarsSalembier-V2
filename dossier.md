# Lars Salembier (202293794)

- [X] Web Services
  - [GitHub repository](https://github.com/Web-IV/2223-webservices-LarsSalembier)
  - [Online versie](github.com/HOGENT-Web)

## Projectbeschrijving

> Dit is een backend voor een website van een jeugdbeweging. Het bevat personen, hun adres, aan welke groep ze leiding geven, hoe die groep eruitziet...
> Het bevat ook de gegevens voor evenementen van de jeugdbeweging en artikels op de website.
Jammergenoeg ben ik door tijdsgebrek slechts in de mogelijkheid geweest om de back-end te schrijven.

## Screenshots

> Voeg enkele (nuttige!) screenshots toe die tonen wat de app doet.

## Behaalde minimumvereisten

### Web Services

- **datalaag**

  - [X] voldoende complex (meer dan één tabel)
  - [X] één module beheert de connectie + connectie wordt gesloten bij sluiten server
  - [X] heeft migraties
  - [X] heeft seeds
        <br />

- **repositorylaag**

  - [X] definieert één repository per entiteit (niet voor tussentabellen) - indien van toepassing
  - [X] mapt OO-rijke data naar relationele tabellen en vice versa
        <br />

- **servicelaag met een zekere complexiteit**

  - [X] bevat alle domeinlogica
  - [X] bevat geen SQL-queries of databank-gerelateerde code
        <br />

- **REST-laag**

  - [X] meerdere routes met invoervalidatie
  - [X] degelijke foutboodschappen
  - [X] volgt de conventies van een RESTful API
  - [X] bevat geen domeinlogica
  - [ ] degelijke authorisatie/authenticatie op alle routes
        <br />

- **varia**
  - [X] een aantal niet-triviale testen (min. 1 controller >=80% coverage)
  - [X] minstens één extra technologie
  - [X] duidelijke en volledige `README.md`
  - [X] maakt gebruik van de laatste ES6-features (object destructuring, spread operator...)
  - [X] volledig en tijdig ingediend dossier

## Projectstructuur

### Web Services

Ik heb me voor de structuur van de applicatie voornamelijk gebaseerd op de voorbeeldapplicatie. Ik volg nagenoeg dezelfde mappenstructuur, deze is dan ook zeer overzichtelijk.

## Extra technologie

### Web Services

Ik heb [ESLint](https://www.npmjs.com/package/eslint) gebruikt om de code clean te houden.

## Testresultaten

### Web Services

Er is full coverage op de address-kolom in de databank, alsook full coverage op enkele onderliggende functionaliteiten hiervan.

[https://gyazo.com/f1e2e014beda6c1be41523cf0d074fb1]

## Gekende bugs

### Web Services

> Er is geen authenticatie.
