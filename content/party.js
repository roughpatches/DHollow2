// Everyone who can be recruited onto a run. One block each; add a character by adding
// a block.
//   id       — how src/party.js refers to them. Never shown.
//   name     — shown in the menu and on the recruiting screen.
//   palette  — their sprite and portrait colours, from PALETTES in tuning.js.
//   hp       — their own HP at level one. Levels add hpPerLevel on top of it.
//   traits   — exactly traitsAtLevelOne ids from content/traits.js. src/party.js
//              complains to the console if the count is wrong.
//   fears    — ids from content/fears.js. A quest carrying one of these as a tag needs
//              a deeper bond before they will walk out on it.
//   bond     — how well they know you at the start, in points. A band is bondPerBand
//              points, so 0 is a stranger and 9 is sworn. See tuning.js.
//   body     — who they are. Yours to write.
// Level, XP, current HP and the bond as it stands now live in src/party.js. This file
// is only what a character starts as.
//
// Traits and fears below were read off what content/npcs.js and content/character.js
// already say about these people — Tally will not walk the north road, Grast goes out
// at first light and not after, Krael has no interest in leaving the smithy. The
// traits are spread so the roster covers all five. Every one is a one-line change.

export const PARTY = [
  {
    id: 'aldis',
    name: 'Aldis Rooke',
    palette: 'hunter',
    hp: 11,
    traits: ['woodcraft', 'animalhandling', 'charisma'],
    fears: ['thedead'], // the grave-pin in their pack that they have mentioned to nobody
    bond: 9,
    body: ['[Placeholder Text]'],
  },
  {
    id: 'tally',
    name: 'Tally Ruin',
    palette: 'drunk',
    hp: 12,
    traits: ['animalhandling', 'sailing', 'charisma'],
    fears: ['thenorthroad', 'dark'],
    bond: 3,
    body: ['[Placeholder Text]'],
  },
  {
    id: 'grast',
    name: 'Sexton Grast',
    palette: 'sexton',
    hp: 13,
    traits: ['woodcraft', 'fishing', 'animalhandling'],
    fears: ['dark', 'thedead'],
    bond: 3,
    body: ['[Placeholder Text]'],
  },
  {
    id: 'vesna',
    name: 'Vesna Quill',
    palette: 'herbalist',
    hp: 10,
    traits: ['fishing', 'charisma', 'animalhandling'],
    fears: ['water', 'harm'],
    bond: 3,
    body: ['[Placeholder Text]'],
  },
  {
    id: 'krael',
    name: 'Bertran Krael',
    palette: 'smith',
    hp: 15,
    traits: ['woodcraft', 'sailing', 'fishing'],
    fears: ['leavingtown', 'water'],
    bond: 0,
    body: ['[Placeholder Text]'],
  },
];
