// Everyone who walks a run: the player, and everyone who can be recruited onto one.
// One block each; add a character by adding a block.
//   id       — how src/party.js refers to them. Never shown.
//   you      — the player. They are on every run without being recruited, and their
//              skills are the three chosen in the hut rather than the three written
//              here, so the block below leaves them empty.
//   name     — shown in the menu and on the recruiting screen.
//   palette  — their sprite and portrait colours, from PALETTES in tuning.js, or the id
//              of a drawn look from content/looks.js if they have real art.
//   con      — their own constitution at level one. Levels add conPerLevel on top of it.
//              A run starts with everyone's added together and drains it as the party
//              walks; at zero they turn for home. It is the whole of what a run costs.
//   skills   — exactly skillsAtLevelOne ids from content/skills.js, against the points
//              spent on each. The points must add up to skillPointsAtLevelOne;
//              src/party.js complains to the console if either count is wrong. The
//              skills not listed are what they are untrained at, and they roll for
//              those on the die alone.
//   fears    — ids from content/fears.js. A quest carrying one of these as a tag needs
//              a deeper bond before they will walk out on it.
//   combat   — true if they can fight. Every night job needs one of them on it, because
//              after dark the road puts up things that have to be fought rather than
//              worked around. Nothing else marks a fighter: no skill, no score, this line.
//              Nobody below carries it yet, so night work is blocked until somebody does.
//   needs    — a story flag they are not recruitable before. See src/story.js.
//   bond     — how well they know you at the start, in points. A band is bondPerBand
//              points, so 0 is a stranger and 9 is sworn. See tuning.js.
//   body     — who they are. Yours to write.
// Level, XP and the bond as it stands now live in src/party.js; the constitution a run
// has left lives on the run, in src/run.js. This file is only what a character starts as.
//
// Skills and fears below were read off what content/npcs.js and content/character.js
// already say about these people — Tally will not walk the north road, Grast goes out
// at first light and not after, Krael has no interest in leaving the smithy. The
// three are picked so the points are spread and each of them is plainly the best in town
// at one thing. Nobody has spent a point on Woodcutting yet — the player is the only one
// who can bring it. Every one of these is a one-line change.

export const PARTY = [
  {
    id: 'you',
    you: true,
    name: 'You',
    palette: 'player',
    con: 11, // the Vitality on the Character tab, and the same number for the same reason
    skills: {}, // filled in by the scene in Aldis's hut. See content/scenes.js.
    bond: 0,
    body: ['[Placeholder Text]'],
  },
  {
    id: 'aldis',
    name: 'Aldis Rooke',
    palette: 'aldis',
    con: 11,
    skills: { woodcraft: 3, animalhandling: 2, perception: 1 },
    fears: ['thedead'], // the grave-pin in their pack that they have mentioned to nobody
    // no combat: he knows the Greywood, he does not fight it. The first job is day work
    // for that reason.
    bond: 9,
    body: ['[Placeholder Text]'],
  },
  {
    id: 'tally',
    needs: 'firstday-done', // nobody else in town is going anywhere yet
    name: 'Tally Ruin',
    palette: 'drunk',
    con: 12,
    skills: { sailing: 3, charisma: 2, animalhandling: 1 },
    fears: ['thenorthroad', 'dark'],
    bond: 3,
    body: ['[Placeholder Text]'],
  },
  {
    id: 'grast',
    needs: 'firstday-done', // nobody else in town is going anywhere yet
    name: 'Sexton Grast',
    palette: 'sexton',
    con: 13,
    skills: { perception: 3, woodcraft: 2, fishing: 1 },
    fears: ['dark', 'thedead'],
    bond: 3,
    body: ['[Placeholder Text]'],
  },
  {
    id: 'vesna',
    needs: 'firstday-done', // nobody else in town is going anywhere yet
    name: 'Vesna Quill',
    palette: 'herbalist',
    con: 10,
    skills: { charisma: 3, perception: 2, fishing: 1 },
    fears: ['water', 'harm'],
    bond: 3,
    body: ['[Placeholder Text]'],
  },
  {
    id: 'krael',
    needs: 'firstday-done', // nobody else in town is going anywhere yet
    name: 'Bertran Krael',
    palette: 'smith',
    con: 15,
    // Smithing left the list, so his three points went to Alchemy: a smith is somebody
    // who knows what heat does to matter. One word if you want them somewhere else.
    skills: { alchemy: 3, woodcraft: 2, sailing: 1 },
    fears: ['leavingtown', 'water'],
    bond: 0,
    body: ['[Placeholder Text]'],
  },
];
