// Everyone in the world and everything they say. Plain strings — rewrite any of it.
// palette names come from PALETTES in tuning.js. x/y are tile coordinates on that map.
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
    palette: 'hunter',
    until: 'washedup', // he is only out there while the opening is unplayed
    lines: ['[Placeholder Text]'],
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
    palette: 'hunter',
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
    id: 'warden',
    name: 'Warden Ilse Marrow',
    map: 'village',
    x: 18,
    y: 3,
    facing: 'down',
    palette: 'warden',
    lines: [
      'North road is shut. Has been since the frost broke.',
      "I'm not stopping you out of spite. I'm stopping you because I've carried back what comes down it.",
      'Two carters this month. What was left of them fit in one sack.',
      "So walk the village. Drink at the Bell. Don't test the treeline after dark.",
      "And if you hear the bell ring and nobody's pulling the rope — you come find me.",
    ],
  },
  {
    id: 'coble',
    name: 'Old Coble',
    map: 'village',
    x: 24,
    y: 14,
    facing: 'down',
    palette: 'elder',
    lines: [
      "Don't drink from it. I know it looks clean.",
      'Well went sour in my grandmother\'s time. Comes up tasting of pennies and something worse.',
      "We keep it uncovered anyway. Sexton says a covered well is a well you've stopped watching.",
      'He says a lot of things. That one I happen to agree with.',
      "Rain barrel behind the Green Room, if you're thirsty. Vesna won't mind.",
    ],
  },
  {
    id: 'grast',
    name: 'Sexton Grast',
    map: 'village',
    x: 29,
    y: 24,
    facing: 'down',
    palette: 'sexton',
    lines: [
      'Mind your feet. Ground here remembers where the soft spots are.',
      'Forty-one graves. I dug thirty-eight of them.',
      "The other three were here before the village was. Different stone. Doesn't weather the same.",
      "Father Emeric says not to think about it. Easy for a man who doesn't hold the shovel.",
      'I check them every morning. Every morning they are exactly as I left them.',
      'That should be a comfort. It has stopped being one.',
    ],
  },
  {
    id: 'pim',
    name: 'Pim',
    map: 'village',
    x: 16,
    y: 12,
    facing: 'down',
    palette: 'child',
    lines: [
      "You're new. Nobody's new here.",
      'I counted the crows on the chapel roof. There were eleven. There are always eleven.',
      "I moved one with a stone once and there were still eleven. I didn't tell anyone.",
      "I'm telling you because you'll be gone soon and it won't matter.",
      'Everybody goes. Mam says the road works both ways but I only ever see the one.',
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
    palette: 'barkeep',
    quests: true,
    lines: ['[Placeholder Text]'],
  },
  {
    id: 'tally',
    name: 'Tally Ruin',
    map: 'tavern',
    x: 12,
    y: 8,
    facing: 'up',
    palette: 'drunk',
    lines: [
      "You buying? No? Then sit further off, I'm working.",
      "Working at forgetting. It's slower than it looks.",
      'I was the third carter. The one that came back.',
      "Marrow'll tell you two went missing. Two went missing. Three went out.",
      "Nobody asks me about it, and I have decided that's a kindness, and I have decided to accept it.",
      "So. Are you buying, or are you going to keep looking at me like that?",
    ],
  },
  {
    id: 'krael',
    name: 'Bertran Krael',
    map: 'smithy',
    x: 7,
    y: 3,
    facing: 'down',
    palette: 'smith',
    lines: [
      "Mind the floor, it's all cinder. Boots'll thank you for staying to the left.",
      'You want work done, you leave it on the bench and come back tomorrow. I do not wait while you watch.',
      "Been at this anvil since I was nine. My father's before that. His mother's before that.",
      "Village needs nails, hinges, hooks, and grave-pins. Mostly grave-pins, lately.",
      "Don't ask what a grave-pin is for. Ask Grast. He'll be pleased somebody did.",
    ],
  },
  {
    id: 'vesna',
    name: 'Vesna Quill',
    map: 'apothecary',
    x: 9,
    y: 5,
    facing: 'down',
    palette: 'herbalist',
    lines: [
      "Careful — half of what's on those shelves is only medicine at the right weight.",
      "Fever, ache, sleep, wounds that won't close. I have something for each and a warning with it.",
      "The sleep draught I will not sell twice to the same person in a month. Don't argue.",
      'Everything I grow comes out of the strip behind the chapel. Best soil in the village.',
      "Grast turns it for me. We have an arrangement neither of us describes out loud.",
      'Rain barrel out back is clean, whatever Coble told you about the well. He is right about the well.',
    ],
  },
  {
    id: 'emeric',
    name: 'Father Emeric Stang',
    map: 'chapel',
    x: 9,
    y: 2,
    facing: 'down',
    palette: 'priest',
    lines: [
      'Sit anywhere. The pews are all equally unkind.',
      'The Quiet Hour is at dusk. No sermon, no singing. We sit and we do not speak.',
      "It began as mourning. It has become the only hour anyone in Dreadhollow is honest.",
      "You will notice I keep the doors open through it. I am asked about that often.",
      "The answer is that a shut door is a decision, and I would rather whatever comes be met than kept out.",
      'That has not yet been tested. I would like it to stay untested. Come at dusk anyway.',
    ],
  },
];
