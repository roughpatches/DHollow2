// The Map tab: where the party can set out for, one entry apiece, with what standing in
// it is like on the right. An entry with an `id` is a zone and is on the tab; everything
// else here is somewhere in town that was written for the old atlas the tab used to be,
// and is kept — it is off the tab, not deleted, and one line in src/scenes/Menu.js puts
// it back.
// Same label/note/body as the other tabs, plus the fields it alone reads:
//   id       — how a quest's `at` names this place, and how content/nodes.js says which
//              nodes belong here. Only a zone a job is walked in needs one, and having
//              one is what puts the place on the Map tab.
//   work     — true if standing work off Gregorious's board can be taken for this zone.
//              A zone without it is somewhere written jobs go and nothing else.
//   skills   — what this zone is made of, as skill ids from content/skills.js. A node in
//              content/nodes.js is drawn here only if everything it asks of the party is
//              on the list: the work in it, both ways through it, and the skill that
//              reads it at a fork. Take a skill off the list and every node that leans on
//              it leaves this zone's pool, still written and still waiting for the zone
//              that wants it. A place with no list draws everything zoned to it.
//   gather   — how much of this place is each kind of gathering work, as shares read
//              against each other. A resource node here is drawn in two steps: which work
//              the party finds, on these shares, and then which of the nodes offering that
//              work it is. The shares are shares of the work, not of the nodes, so a node
//              with two harvests is reached by either of its two rolls and turns up more
//              often than one share alone would put it — which is a mixed stand behaving
//              like a mixed stand. Retune the wood by editing these four numbers and
//              nothing else. A place with no table draws its resource nodes on their own
//              weights.
//   trouble  — how much of the road here is something in the way rather than work, per
//              hundred, by the hour. One number and it stays put however many encounter
//              nodes get written: node weights then only decide which trouble the party
//              meets, never how much of it there is. A place with no `trouble` falls back
//              to the nodes' own weights against each other, where writing another
//              encounter moved the shape of every run a little.
//   environment — what it is like to stand in, a word apiece, shown as a row of icons
//              along the bottom of the tab. A word with no icon of its own gets the blank
//              square until there is art for it; see src/icons.js.
//   resources — and what comes off it, the same way. Material ids draw the material's own
//              icon, so a resource the game already carries needs no art of its own.
//   backdrop — a painted landscape for runs walked in this zone, and how far down the
//              image its ground line sits. It is also the picture the Map tab shows. Drawn at 1:1 and tiled across, so it wants to
//              be pixel art at the game's own scale; `ground` is what registers its floor
//              to the road the party walks on. A zone without one gets the generated
//              bands. See src/walk.js.
//   terrain  — the ground a zone is: forest, water, and whatever else gets walked on.
//              A skill that reads that ground is worth constitution to everyone who sets
//              out here; see `terrain` in content/skills.js and conPerTerrainPoint in
//              tuning.js. A place with no terrain gives nobody anything.
//   map      — which panel in content/maps.js to draw. Required; an entry without it is a list row.
//   at       — optional place to mark on that map, for a landmark inside a larger place:
//              one number, how far along the panel it stands.
//   quest    — optional id from content/quests.js. The entry becomes somewhere you set
//              out for: its state is read live, and Enter starts the job when it can be.
//   building — optional id from content/buildings.js. The building's repair state and what
//              it still wants are shown above the prose, read live from the town.
// Doors, everyone standing on the map, and the player's own position are drawn from the
// live world, so a place only needs writing about once and never needs its pins updating.

export const PLACES = [
  {
    label: 'Dreadhollow',
    note: 'Open ground',
    map: 'harbourroad',
    body: [
      'Dying grass over most of it, a granite pavement in the middle laid for more people than are left to stand on it, and a bank of packed earth running down the east side to the water.',
      'It reads west to east like a tide going out — or in. The wood is at your back, the sea is in front of you, and everything anybody ever built here is on the ground between.',
    ],
  },
  {
    label: 'The paving',
    note: 'Open ground',
    map: 'quay',
    at: [20],
    body: [
      'Imperial setts, laid wide enough for a market and a road out of it, going green in the joints a course at a time.',
      'It is the only part of town that was ever finished.',
    ],
  },
  {
    label: 'The chapel',
    note: 'Ruin',
    map: 'woodend',
    at: [37],
    building: 'chapel',
    body: [
      'It shuts off the north end of the paving, and it is the tallest thing left standing in Dreadhollow even with its roof in the nave.',
      'The stone is sound. Everything above the stone is not.',
    ],
  },
  {
    // The east side of town. No dock stands on it yet, which is the point of it.
    terrain: 'water',
    label: 'The foreshore',
    note: 'Shore',
    map: 'quay',
    at: [34],
    body: [
      'The bank runs out into a broad muddy flat and the flat runs out into deep water. There is nothing built on any of it.',
      'A harbour was worth cutting here once. You can see where from the shape of the ground.',
    ],
  },
  {
    // North up the coast from the town, and the beach is how you walk between them.
    label: 'The point',
    note: 'Open ground',
    map: 'shore',
    body: [
      'A north-facing spit of muddy sand at the top of the beach, out of sight of the town.',
      'This is where the tide put you.',
    ],
  },
  {
    label: 'Aldis Rooke\'s house',
    note: 'Indoors',
    map: 'hut',
    body: ['[Placeholder Text]'],
  },
  {
    // No walkable map: the Greywood is where a run happens, not somewhere you stroll.
    // `quest` makes the entry somewhere you set out for — Enter starts the job.
    id: 'greywood',
    work: true, // and it is somewhere standing work can be taken for; see content/quests.js
    // What the wood is made of. All four gathering skills are on it, so the wood draws the
    // whole of that table: a node for each of them alone and a node for each pairing of
    // two. Sailing, Mountaineering, Fording, Alchemy, Smithing and Gem Cutting are
    // deliberately off it — there is no tide, no marsh and no forge in the Greywood, and
    // the nodes that want them are written and waiting for somewhere that has them. Put
    // one back on this line and its nodes come back with it.
    skills: [
      'woodcraft',
      'intimidation', 'persuasion', 'investigation', 'insight',
      'woodcutting', 'fishing', 'mining', 'herblore',
      'cooking',
    ],
    // What the wood is mostly made of, in the work rather than in the nodes: two parts
    // timber to one and a half of herb, one of fish and half of stone. Read against each
    // other like every other table of odds here, so they need not add up to a hundred.
    gather: { woodcutting: 40, herblore: 30, fishing: 20, mining: 10 },
    // And how much of the road is something in the way rather than work. After dark more
    // of it is, because after dark there is more out there to be in the way.
    trouble: { day: 40, night: 55 },
    terrain: 'forest',
    backdrop: { image: 'art/greywood/backdrop.png', ground: 350 },
    label: 'The Greywood',
    note: 'Wilds',
    quest: 'firstday',
    environment: ['forest', 'water', 'dark'],
    resources: ['timber', 'oakbranch', 'blacktrumpet', 'heronfeather'],
    body: ['[Placeholder Text]'],
  },
  {
    // The panel west. The town is painted a panel at a time; this is the far end of it.
    label: 'The west end',
    note: 'Open ground',
    map: 'woodend',
    body: [
      'A clock that stopped, the Sea Hag under it, and the burnt-out shell of something older leaning on the end of the row.',
      'West of here the cobbles give out and the road is just road.',
    ],
  },
  {
    // The next panel east. The town is painted a panel at a time; this is the second.
    label: 'The wharf',
    note: 'Open ground',
    map: 'quay',
    body: [
      'Timber-framed shops leaning over the cobbles, a jetty going out over the mud, and a boat pulled up on it that nobody has had out in a long while.',
      'The road stops being a road here and starts being a way down to the water.',
    ],
  },
  {
    label: 'The Sea Hag',
    note: 'Indoors',
    map: 'tavern',
    building: 'tavern',
    body: ['[Placeholder Text]'],
  },
];
