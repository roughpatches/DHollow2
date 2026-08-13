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
// Aldis is the only recruit for now: the rest of the cast is being written. Everyone
// still standing around town in content/npcs.js is somebody to talk to, not somebody to
// take — a character becomes recruitable by getting a block here.

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
    // His two Animal Handling points came onto Woodcraft in the merge. Perception stays
    // where it was; the spare point went to Woodcutting because he is the one who picks
    // the stand, and nobody else in town has a point of it.
    skills: { woodcraft: 3, perception: 2, woodcutting: 1 },
    fears: ['thedead'], // the grave-pin in their pack that they have mentioned to nobody
    // no combat: he knows the Greywood, he does not fight it. The first job is day work
    // for that reason.
    bond: 9,
    body: ['[Placeholder Text]'],
  },
];
