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
// `behind` stands somebody on the far side of something painted — a bar, a counter, a
// wall — and is how far down the panel that thing's top edge is. They stand at the back
// of the room and nothing of them below the line is drawn. On a street only.

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
    x: 12, // behind the bar, in the clear stretch of counter between the mugs
    facing: 'right', // down the room, at whoever has just come in
    palette: 'gregorious-bar', // the standing barkeep; see content/looks.js
    portrait: 'gregorious', // that export has no face, so he talks with the one that has
    // `behind` puts somebody on the far side of something painted: they stand at the back
    // of the room and nothing of them below this line is drawn. 245 is the bar top, which
    // takes him at the waist.
    behind: 245,
    quests: true,
    lines: ['Fancy a drink, or looking to make a little coin?'],
  },

  // The six townsfolk who stood on the old map — Mother Cray, Ned Salt, Wick, Tallow,
  // Bess Harrow and Old Pell — are not placed on this one. Their written lines are in the
  // branch history at 1a46353:content/npcs.js, ready to go back the moment there is a quay,
  // a burying ground and a row of doors for them to stand at.
];
