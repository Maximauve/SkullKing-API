# Skull King - API

## Sommaire

- [Pré-requis](#pré-requis)
- [Installation](#installation)
- [Lancement](#lancement)
- [Ajouter des mots à l'API](#ajouter-des-mots-dans-lapi)

## Pré-requis

- [Node.js](https://nodejs.org/en/) (version 18.x ou supérieure)
- Cloner les deux autres répositories **à la même arborescence que ce répository** (penser à lire les pré-requis également)
    - [Skull King - React](https://github.com/Maximauve/SkullKing)
    - [Skull King - Docker](https://github.com/Maximauve/SkullKing-Docker)
- ESLint

## Installation
```bash
npm install
```
Mettre le .env.local à la racine du projet :
```dotenv
JWT_SECRET='E39F26B4137EF18DCE39D811937C5'
POSTGRES_DATABASE='skull_king'
POSTGRES_HOST='localhost'
POSTGRES_PORT=5432
POSTGRES_PASSWORD='beats_the_skull_king'
POSTGRES_URL='postgres://mermaid:beats_the_skull_king@localhost:5432/skull_king'
POSTGRES_USER='mermaid'
POSTGRES_SSL='false'
REDISCLOUD_URL='redis://default:beats_the_skull_king@localhost:6379'
REDIS_HOST='localhost'
REDIS_PASSWORD='beats_the_skull_king'
REDIS_PORT=6379
REDIS_USERNAME='default'
```

## Lancement
- Lancer le Docker
```bash
npm run start
# pour lancer en mode hot-reload :
npm run start:dev
```

## Ajouter des mots dans l'API
Dans cette partie se trouve un tableau de mots à ajouter dans la base de donnée afin de pouvoir créer une partie. \
A l'aide d'un postman ou autre, il faudra créer un compte et se connecter manuellement afin de récupérer son token JWT, pour ensuite pouvoir ajouter les mots. \
Pour créer un compte: `POST http://localhost:3000/users/auth/sign-up` :
```json
{
  "username": "your_username",
  "email": "your.mail@example.com",
  "password": "your_password_s€cr3t"
}
```

Pour se connecter : `POST http://localhost:3000/users/auth/login` :
```json
{
  "email": "your.mail@example.com",
  "password": "your_password_s€cr3t"
}
```

Pour créer les mots : `POST http://localhost:3000/pirate-glossary` \
Ajouter à la section "Authentication", le Bearer token que le 
```json
{
  "word": [
    "Pirate",
    "Ship",
    "Gold",
    "Sword",
    "Mermaid",
    "Sea",
    "Flag",
    "Chest",
    "Map",
    "Rum",
    "Cannon",
    "Booty",
    "Sail",
    "Crew",
    "Island",
    "Dagger",
    "Plank",
    "Whale",
    "Anchor",
    "Captain",
    "Cove",
    "Loot",
    "Parrot",
    "Cutlass",
    "Maroon",
    "Sloop",
    "Hat",
    "Matey",
    "Shark",
    "Spyglass",
    "Barrel",
    "Buccaneer",
    "Swashbuckler",
    "Marauder",
    "Smuggler",
    "Ransom",
    "Crossbones",
    "Cannonball",
    "Boots",
    "Pieces",
    "Blackbeard",
    "Locker",
    "Scallywag",
    "Grog",
    "Shipmate",
    "Black",
    "Tooth",
    "Doubloons",
    "Plunder",
    "Corsair",
    "Treasure",
    "Scabbard",
    "Scurvy",
    "Shipwreck",
    "Mutiny",
    "Gunpowder",
    "Skull",
    "Mariner",
    "Rudder",
    "Spyglass",
    "Jewels",
    "Smuggler",
    "Parchment",
    "Marooned",
    "Hunter",
    "Costume",
    "Hat",
    "Longboat",
    "Buccaneering",
    "Crocodile",
    "Doubloons",
    "Galleon",
    "Plunderer",
    "Bandana",
    "Plundering",
    "Cannonade",
    "Swab",
    "Barrelful",
    "Ransack",
    "Scourge",
    "Brigantine",
    "Cutthroat",
    "Privateer",
    "Lookout",
    "Buccaneership",
    "Swordfight",
    "Horatio",
    "Buried",
    "Ocean",
    "Rowboat",
    "Shipwrecked",
    "Groggy",
    "Hurricane",
    "Kraken",
    "Skeleton",
    "Stormy",
    "Caribbean",
    "Rumrunner",
    "Scabbard",
    "Anchor",
    "Bilge",
    "Swab",
    "Freebooter",
    "Jib",
    "Crowsnest",
    "Abandon",
    "Belay",
    "Helm",
    "Ropes",
    "Pearl",
    "Adventure",
    "Marauder",
    "Gangplank",
    "Plank",
    "Hook",
    "Poop",
    "Deck",
    "Navigation",
    "Grog",
    "Broadside",
    "Corsair",
    "Mariner",
    "Matey",
    "Mast",
    "Tall",
    "Swab",
    "Freebooter",
    "Scoundrel",
    "Scuttle"
  ]
}
```
Ceci est une liste à titre indicatif, libre à vous d'ajouter n'importe quel mot que vous souhaitez, à condition que ce soit un mot simple !
