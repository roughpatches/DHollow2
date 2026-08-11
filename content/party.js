// Every playable character. One block each; add a character by adding a block.
//   id       — how src/party.js refers to them. Never shown.
//   name     — shown in the menu.
//   palette  — their sprite and portrait colours, from PALETTES in tuning.js.
//   hp       — their own HP at level one. Levels add hpPerLevel on top of it.
//   traits   — exactly traitsAtLevelOne ids from content/traits.js. src/party.js
//              complains to the console if the count is wrong.
//   body     — who they are. Yours to write.
// Level, XP, and current HP are not here: those change while the game runs and live
// in src/party.js. This file is only what a character starts as.

export const PARTY = [
  {
    id: 'aldis',
    name: 'Aldis Rooke',
    palette: 'player',
    hp: 11, // the Vitality on their Character sheet
    // picked off what the Character and Equipment pages already say about them: the
    // hedging knife, the carter's road, and a habit of noticing. Swap freely.
    traits: ['woodcraft', 'animalhandling', 'charisma'],
    body: ['[Placeholder Text]'],
  },
];
