// Everyone in the world and everything they say. Three people so far: the hunter who
// pulled you off the strand, and the landlord who has the work. The rest of the town is
// still to be written. Plain strings — rewrite any of it.
// palette names come from PALETTES in tuning.js, or from content/looks.js for anyone
// with drawn art instead of a generated placeholder. x/y are tile coordinates on the map.
// The palette also picks the portrait shown while they speak; add `portrait: 'name'` to
// give someone a face from a different palette than the one they walk around in.
// Anywhere a line isn't written yet, put [Placeholder Text] — the Script tab in the
// menu lists every one of them, and an NPC with no `lines` at all gets one for free.
// `until` / `after` name a scene from content/scenes.js: someone with `until` is gone
// once it has played, someone with `after` is not there until it has. The same id can
// appear on more than one map — it is the same person, standing somewhere else.
// `says` replaces `lines` with a list of answers, each with its own `needs` / `not`;
// the first one whose conditions hold is what they say, and its `sets` is raised.

export const NPCS = [
  {
    // The hunter. He is the one who finds the player on the strand in the opening,
    // so he stands where the scene needs him to start from.
    id: 'aldis',
    name: 'Aldis Rooke',
    map: 'shore',
    x: 31,
    y: 8,
    facing: 'left',
    palette: 'aldis', // real art; see content/looks.js
    until: 'washedup', // he is only out there while the opening is unplayed
    // Nothing to say: the scene has hold of the player the whole time he is on the
    // strand, and he is gone the moment it lets go. `silent` keeps him off the Script
    // tab, which is for lines somebody could actually hear.
    silent: true,
  },
  {
    // The same man, at home, from the morning after onward. `says` is a list of
    // answers: the first whose conditions hold is the one he gives. See src/story.js.
    id: 'aldis',
    name: 'Aldis Rooke',
    map: 'hut',
    x: 5,
    y: 4,
    facing: 'left',
    palette: 'aldis', // real art; see content/looks.js
    says: [
      {
        needs: 'firstday-offered',
        not: 'aldis-agreed',
        sets: 'aldis-agreed',
        beat: 'Gregorious has asked. Aldis agrees to walk them into the Greywood for the timber.',
        lines: ['[Placeholder Text]'],
      },
      {
        needs: 'aldis-agreed',
        not: 'firstday-done',
        beat: 'Already agreed. Ready when they are — the Greywood is on the map.',
        lines: ['[Placeholder Text]'],
      },
      {
        beat: 'Anything else. Before Gregorious asks, and after the first day is done.',
        lines: ['[Placeholder Text]'],
      },
    ],
  },
  {
    // `quests: true` makes someone the quest dispenser: what is open in the Quest Log
    // is read out after their own lines. Only one person needs it.
    id: 'gregorious',
    name: 'Gregorious',
    map: 'tavern',
    x: 12,
    y: 5,
    facing: 'down',
    palette: 'gregorious', // real art; see content/looks.js
    quests: true,
    lines: ['Fancy a drink, or looking to make a little coin?'],
  },

  // --- the town ---------------------------------------------------------------
  // Eleven houses with anybody in them, and these are the people who are outdoors in
  // them. Placeholder palettes from tuning.js until any of them have art.
  {
    id: 'cray',
    name: 'Mother Cray',
    map: 'village',
    x: 28,
    y: 44,
    facing: 'left', // out at the water, over her work
    palette: 'elder',
    lines: [
      'Mind the boards on the second dock. They look like decking and they are not.',
      'I mend nets for four boats. There is one boat. You do the arithmetic on that and tell me what I am doing out here.',
    ],
  },
  {
    id: 'nedsalt',
    name: 'Ned Salt',
    map: 'village',
    x: 34,
    y: 43,
    facing: 'up',
    palette: 'drunk',
    lines: [
      'Hag opens when Gregorious feels like it and shuts when the light goes. Same as everything.',
      'You came off the point, they say. Off the point, in that. Hm.',
      'I would not go back up that way after dark. I would not go anywhere after dark, but especially not that way.',
    ],
  },
  {
    id: 'wick',
    name: 'Wick',
    map: 'village',
    x: 73,
    y: 11,
    facing: 'down',
    palette: 'sexton',
    lines: [
      'Sexton. Still sexton, though the chapel it belongs to has no roof, so mostly I cut grass.',
      'Forty-one stones in here and I know every name on them. Some of the newer ones I put in myself, and I did not have anybody to help me carry.',
      'If the roof goes back on that, I will ring the bell. There is still a bell.',
    ],
  },
  {
    id: 'tallow',
    name: 'Tallow',
    map: 'village',
    x: 66,
    y: 20,
    facing: 'down',
    palette: 'child',
    lines: [
      'The well is dry. You can shout down it and it does not answer properly.',
      'There were twelve of us. Now it is me and the Harrow girls and they are not allowed out past the square.',
    ],
  },
  {
    id: 'bess',
    name: 'Bess Harrow',
    map: 'village',
    x: 72,
    y: 40,
    facing: 'right',
    palette: 'herbalist',
    lines: [
      'Everything worth picking grows where the houses used to be. Ask me why and I will tell you it is the lime in the old mortar, and that is only half of it.',
      'This was a lane. There were gates along it and a name for it. Now it is where I go for nettles.',
      'Do not follow it any further than I do.',
    ],
  },
  {
    id: 'pell',
    name: 'Old Pell',
    map: 'village',
    x: 43,
    y: 50,
    facing: 'left',
    palette: 'warden',
    lines: [
      'This whole row was fishing families. Nine doors. Mine is the one with anybody behind it.',
      'The fish are still out there. That is not the problem. The problem is what you do with the fish once you have them and nobody comes to buy.',
    ],
  },
];
