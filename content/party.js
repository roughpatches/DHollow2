// Everyone who walks a run: the player, and everyone who can be recruited onto one.
// One block each; add a character by adding a block.
//   id       — how src/party.js refers to them. Never shown.
//   you      — the player. They are on every run without being recruited, and their
//              traits are the three chosen in the hut rather than the three written
//              here, so the block below leaves them empty.
//   name     — shown in the menu and on the recruiting screen.
//   palette  — their sprite and portrait colours, from PALETTES in tuning.js, or the id
//              of a drawn look from content/looks.js if they have real art.
//   hp       — their own HP at level one. Levels add hpPerLevel on top of it.
//   traits   — exactly traitsAtLevelOne ids from content/traits.js, against the points
//              spent on each. The points must add up to traitPointsAtLevelOne;
//              src/party.js complains to the console if either count is wrong. The
//              traits not listed are what they are untrained at, and they roll for
//              those on the die alone.
//   fears    — ids from content/fears.js. A quest carrying one of these as a tag needs
//              a deeper bond before they will walk out on it.
//   needs    — a story flag they are not recruitable before. See src/story.js.
//   bond     — how well they know you at the start, in points. A band is bondPerBand
//              points, so 0 is a stranger and 9 is sworn. See tuning.js.
//   body     — who they are. Yours to write.
// Level, XP, current HP and the bond as it stands now live in src/party.js. This file
// is only what a character starts as.
//
// Traits and fears below were read off what content/npcs.js and content/character.js
// already say about these people — Tally will not walk the north road, Grast goes out
// at first light and not after, Krael has no interest in leaving the smithy. The
// three are picked so the roster covers every trait, and the points are spread so each
// of them is plainly the best in town at one thing. Every one is a one-line change.

export const PARTY = [
  {
    id: 'you',
    you: true,
    name: 'You',
    palette: 'player',
    hp: 11, // the Vitality on the Character tab, and the same number for the same reason
    traits: {}, // filled in by the scene in Aldis's hut. See content/scenes.js.
    bond: 0,
    body: ['[Placeholder Text]'],
  },
  {
    id: 'aldis',
    name: 'Aldis Rooke',
    palette: 'aldis',
    hp: 11,
    traits: { woodcraft: 3, animalhandling: 2, perception: 1 },
    fears: ['thedead'], // the grave-pin in their pack that they have mentioned to nobody
    bond: 9,
    body: ['[Placeholder Text]'],
  },
  {
    id: 'tally',
    needs: 'firstday-done', // nobody else in town is going anywhere yet
    name: 'Tally Ruin',
    palette: 'drunk',
    hp: 12,
    traits: { sailing: 3, charisma: 2, animalhandling: 1 },
    fears: ['thenorthroad', 'dark'],
    bond: 3,
    body: ['[Placeholder Text]'],
  },
  {
    id: 'grast',
    needs: 'firstday-done', // nobody else in town is going anywhere yet
    name: 'Sexton Grast',
    palette: 'sexton',
    hp: 13,
    traits: { perception: 3, woodcraft: 2, fishing: 1 },
    fears: ['dark', 'thedead'],
    bond: 3,
    body: ['[Placeholder Text]'],
  },
  {
    id: 'vesna',
    needs: 'firstday-done', // nobody else in town is going anywhere yet
    name: 'Vesna Quill',
    palette: 'herbalist',
    hp: 10,
    traits: { charisma: 3, perception: 2, fishing: 1 },
    fears: ['water', 'harm'],
    bond: 3,
    body: ['[Placeholder Text]'],
  },
  {
    id: 'krael',
    needs: 'firstday-done', // nobody else in town is going anywhere yet
    name: 'Bertran Krael',
    palette: 'smith',
    hp: 15,
    traits: { smithing: 3, woodcraft: 2, sailing: 1 },
    fears: ['leavingtown', 'water'],
    bond: 0,
    body: ['[Placeholder Text]'],
  },
];
