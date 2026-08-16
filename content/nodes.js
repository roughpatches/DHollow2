// What a drawn run is made of. A quest with no authored `line` walks these;
// content/encounters.js holds the authored nodes a main quest names by hand.
//
// There are two kinds and no third, and both of them are a choice between two things.
//   A RESOURCE node is somewhere with something in it. It carries one or two harvests,
//   each with its own skill and its own yield, and the party works one of them: there is
//   a day's light and one of it, so the other is left standing. A harvest whose skill
//   nobody has cannot be chosen, and a node where that is true of all of them is walked
//   past. The same resource node is never put up twice running.
//   An ENCOUNTER node is something in the way. It offers two ways through, each one a
//   skill check, and the party takes one of them. A run only ever has one of each: the
//   same thing happening twice on one walk out reads as the road running short.
//
// Both kinds:
//   id      — how src/run.js refers to it, and how content/looks.js hangs art on it.
//   name    — shown at the top of the node.
//   zones   — the place ids from content/places.js this can turn up in. A node listing a
//             zone that is not open yet is content waiting on the zone, not a mistake.
//   nature  — gather, talk, hazard or combat. Says what a run is likely to be made of
//             before it is walked, and does one thing besides: a combat node is drawn
//             only after dark, whatever its weight says.
//   weight  — how often it comes up by day and by night, against everything else drawn
//             in the same zone. Nothing is ever zero.
//   read    — the skill that can name this at a fork and the line whoever has the most
//             points in it says. Everything here has one, because a fork nobody can read
//             is a coin toss with extra steps.
//   xp      — experience, [least, most].
//   con     — what standing here does to the party's constitution, [least, most].
//             Negative takes and positive gives. Night multiplies what it takes.
//   body    — what it is, in the world's voice. Yours to write.
//
// A resource node also has:
//   harvests — one or two of them. Each names the skill the work is done with, the
//             activity it will become once that engine is imported, and what comes off
//             it: `spoils` for a fixed list, [least, most] each, and `draw` for a yield
//             that is a question of luck — `count` things come off it, each one drawn
//             against `odds`. Odds are read against each other and need not add up to a
//             hundred. Points in the skill take more off it and bend the table toward
//             its scarce end; see tuning.js. Write two of them and the node becomes a
//             question the party is asked where they stand, so write two the same crew
//             would want differently — not two spellings of one job.
//
// An encounter node also has:
//   ways    — two of them. Each is `text` (the way as it is offered), the `skill` and
//             `dc` it is rolled at, `tried` (the attempt, said before the roll is read
//             back), and `held` / `lost`. `spoils` and `con` are what holding it is
//             worth; `lostCon` is what losing it costs, written positive. Write the two
//             ways for two different skills — a way naming a skill nobody on the run has
//             is shown and will not answer, and a node where both are shut is a node the
//             party walks past.
//
// Add a node by adding a block. Nothing reads either list by position.

export const RESOURCE_NODES = [
  {
    id: 'woodland',
    name: 'Standing timber',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 5, night: 1 },
    read: { skill: 'woodcraft', line: 'Old cut stumps. Somebody worked this side, and there is more of it standing.' },
    harvests: [
      {
        skill: 'woodcutting',
        activity: 'Felling',
        spoils: { timber: [2, 4] },
        draw: { count: [1, 3], odds: { oakbranch: 50, oaklog: 30, heartwood: 12 } },
      },
      {
        // The second thing standing here, and nothing to do with the first: what grows on
        // the dead wood at the foot of a stand nobody has cleared in twenty years.
        skill: 'alchemy',
        activity: 'Foraging',
        draw: { count: [1, 2], odds: { blacktrumpet: 40, oystermushroom: 30 } },
      },
    ],
    xp: [8, 14],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'deadfall',
    name: 'A beech gone over in the wind',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 4, night: 2 },
    read: { skill: 'woodcutting', line: 'Something big came down that way and it came down recently. The wood in it will still be sound.' },
    harvests: [
      {
        skill: 'woodcutting',
        activity: 'Sawing',
        spoils: { timber: [1, 3] },
        draw: { count: [1, 2], odds: { oaklog: 40, oakbranch: 40 } },
      },
      {
        skill: 'alchemy',
        activity: 'Foraging',
        draw: { count: [1, 3], odds: { oystermushroom: 50, blacktrumpet: 25 } },
      },
    ],
    xp: [8, 14],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'water',
    name: 'Standing water',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 4, night: 2 },
    read: { skill: 'fishing', line: 'Rings on the surface, and they are not the rain. There is a lane feeding that way.' },
    harvests: [
      {
        skill: 'fishing',
        activity: 'Casting',
        draw: { count: [1, 3], odds: { bluegill: 50, perch: 30, brooktrout: 20 } },
      },
      {
        // Everything the water has caught and held onto, which in this wood is not
        // driftwood. Whoever is shooting the Greywood has been standing on this bank.
        skill: 'perception',
        activity: 'Searching',
        draw: { count: [0, 2], odds: { eggshell: 40, nails: 30, greyarrow: 15 } },
      },
    ],
    xp: [10, 16],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'nest',
    name: 'Something emptied a nest here',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 3, night: 2 },
    read: { skill: 'perception', line: 'There is grey down caught along that whole branch line, and none of it fell.' },
    harvests: [
      {
        skill: 'perception',
        activity: 'Searching',
        draw: { count: [1, 2], odds: { heronfeather: 40, eggshell: 35, greyarrow: 15 } },
      },
    ],
    xp: [10, 16],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'crag',
    name: 'Broken crag',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 4, night: 1 },
    read: { skill: 'smithing', line: 'The face on that outcrop is fresh. It has come away square before and it will again.' },
    harvests: [
      { skill: 'smithing', activity: 'Quarrying', spoils: { stone: [2, 4] } },
    ],
    xp: [8, 14],
    con: [-2, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'oldiron',
    name: 'Iron in the ditch',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 3, night: 2 },
    read: { skill: 'smithing', line: 'There is a cart axle in that ditch, and axles do not come out here on their own.' },
    harvests: [
      { skill: 'smithing', activity: 'Salvage', spoils: { nails: [2, 5], stone: [0, 1] } },
    ],
    xp: [10, 16],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'find',
    name: 'Left behind',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 3, night: 2 },
    read: { skill: 'perception', line: 'Something is stacked too neatly on that side to have got there by weather.' },
    harvests: [
      { skill: 'perception', activity: 'Searching', spoils: { timber: [1, 2], nails: [1, 3] } },
    ],
    xp: [6, 10],
    con: [0, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'animal',
    name: 'Something living',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 4, night: 3 },
    read: { skill: 'woodcraft', line: 'Tracks. Something came through here on four legs and was not hurrying.' },
    harvests: [
      // a cured hide is the same material as sailcloth to anyone patching a roof with it
      { skill: 'woodcraft', activity: 'Calming', spoils: { canvas: [1, 2] } },
    ],
    xp: [12, 20],
    con: [-2, 0],
    body: ['[Placeholder Text]'],
  },
  {
    // The one node that gives the party something back instead of taking it: they stop,
    // put a fire on and cook what they are carrying. Nothing is carried home from it —
    // they ate it — so what it is worth is the constitution, which is on the node.
    // Gated on Alchemy like anything else: a party with nobody who can cook walks past a
    // pile of dry wood, which is the reason to take somebody who can.
    id: 'fire',
    name: 'A fire, and what you carry',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 2, night: 4 }, // mostly a thing done after dark, when it is wanted most
    read: { skill: 'alchemy', line: 'There is dry wood under that overhang, and it is the last of it for a mile.' },
    harvests: [
      { skill: 'alchemy', activity: 'Cooking' },
    ],
    xp: [8, 14],
    con: [2, 4], // a meal, and what it is worth to a party who have been walking all day
    body: ['[Placeholder Text]'],
  },
  {
    // Written for the shore, which is not a zone anybody can set out for yet. It draws
    // nowhere until 'foreshore' opens; nothing else has to change on the day it does.
    id: 'wreck',
    name: 'Wreck on the shore',
    zones: ['foreshore'],
    nature: 'gather',
    weight: { day: 3, night: 2 },
    read: { skill: 'sailing', line: 'The water runs wrong ahead. Something is aground on that side.' },
    harvests: [
      { skill: 'sailing', activity: 'Rigging', spoils: { canvas: [1, 3], timber: [1, 2] } },
    ],
    xp: [10, 18],
    con: [-2, 0],
    body: ['[Placeholder Text]'],
  },
];

export const ENCOUNTER_NODES = [
  {
    id: 'hazard',
    name: 'Bad ground',
    zones: ['greywood'],
    nature: 'hazard',
    weight: { day: 2, night: 4 },
    read: { skill: 'perception', line: 'The path ahead is holding water it has no business holding.' },
    xp: [4, 8],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
    ways: [
      {
        text: 'Call the halt and sound it before anybody crosses.',
        skill: 'perception',
        dc: 12,
        tried: 'The party stops where they are told to stop, and a stick goes in ahead of a boot.',
        held: 'Somebody calls the halt a pace before it matters.',
        lost: 'Nobody calls anything, and the ground takes the first one across it.',
        con: 1,
        lostCon: 3,
      },
      {
        text: 'Go round it, on whatever the trees are standing in.',
        skill: 'woodcraft',
        dc: 12,
        tried: 'The long way, on root and stone, with the bad ground kept on one side the whole time.',
        held: 'Roots the whole way. It costs an hour and nothing else.',
        lost: 'The dry line runs out halfway along it and the party finds that out standing on it.',
        lostCon: 2,
      },
    ],
  },
  {
    id: 'thorn',
    name: 'The thicket',
    zones: ['greywood'],
    nature: 'hazard',
    weight: { day: 4, night: 2 },
    read: { skill: 'woodcraft', line: 'Bramble across the whole of that side, and it is older than the path is.' },
    xp: [6, 10],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
    ways: [
      {
        text: 'Cut a way through it.',
        skill: 'woodcutting',
        dc: 12,
        tried: 'Steel into old bramble, low down where the canes come out of the ground.',
        held: 'It opens in three cuts and the party walks it upright.',
        lost: 'It closes behind every cut and the party comes out the far side wearing most of it.',
        spoils: { timber: [0, 1] },
        lostCon: 3,
      },
      {
        text: 'Find the run something else has already made through it.',
        skill: 'woodcraft',
        dc: 13,
        tried: 'Down at knee height, where anything living would have gone through it.',
        held: 'There is a run, and it comes out where the path picks up again.',
        lost: 'There are four runs and every one of them ends in more bramble.',
        lostCon: 2,
      },
    ],
  },
  {
    id: 'mire',
    name: 'The ground gives',
    zones: ['greywood'],
    nature: 'hazard',
    weight: { day: 3, night: 3 },
    read: { skill: 'sailing', line: 'That is standing water with a current under it. It goes somewhere.' },
    xp: [6, 12],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
    ways: [
      {
        text: 'Read the water and cross where it is running.',
        skill: 'sailing',
        dc: 13,
        tried: 'The party goes in where the surface is moving, because moving water has a bottom.',
        held: 'Knee deep the whole way, and gravel under it the whole way.',
        lost: 'It is moving because something is pulling it, and what it is pulled into is soft.',
        lostCon: 3,
      },
      {
        text: 'Corduroy it — lay wood down and walk on the wood.',
        skill: 'woodcutting',
        dc: 12,
        tried: 'Whatever is standing near enough comes down and goes in flat, one length at a time.',
        held: 'It holds. It will still be there next time anybody comes this way.',
        lost: 'The first three lengths go under and take the fourth with them.',
        lostCon: 2,
      },
    ],
  },
  {
    id: 'folk',
    name: 'Folk on the road',
    zones: ['greywood'],
    nature: 'talk',
    weight: { day: 5, night: 1 },
    read: { skill: 'charisma', line: 'Somebody has walked this recently and stopped to talk while they did.' },
    xp: [10, 16],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
    ways: [
      {
        text: 'Trade with them.',
        skill: 'charisma',
        dc: 12,
        tried: 'Nobody names a price first, which is the whole of the game.',
        held: 'They name it first, and it is a good deal better than the one you were going to name.',
        lost: 'You name it first.',
        spoils: { nails: [2, 4] },
        lostCon: 1,
      },
      {
        text: 'Say nothing and look at what they are carrying.',
        skill: 'perception',
        dc: 12,
        tried: 'Packs, hands, boots, and what the boots have been standing in.',
        held: 'They have come from somewhere with cut stone in it, and they say where without being asked twice.',
        lost: 'They notice the looking before you notice anything worth having looked for.',
        spoils: { stone: [1, 2] },
        lostCon: 1,
      },
    ],
  },
  {
    id: 'strangers',
    name: 'Strangers, and no lamp',
    zones: ['greywood'],
    nature: 'talk',
    weight: { day: 2, night: 4 },
    read: { skill: 'charisma', line: 'Somebody stood here a while and did not want to be seen doing it.' },
    xp: [12, 20],
    con: [-2, 0],
    body: ['[Placeholder Text]'],
    ways: [
      {
        text: 'Talk past them.',
        skill: 'charisma',
        dc: 14,
        tried: 'Loudly, and about nothing, and without ever stopping walking.',
        held: 'They decide, out loud, that you are nobody worth the trouble.',
        lost: 'They decide the other thing, and they decide it first.',
        spoils: { nails: [1, 3] },
        lostCon: 3,
      },
      {
        text: 'Go round without being seen going round.',
        skill: 'perception',
        dc: 13,
        tried: 'Off the path, downwind, and slower than anybody wants to be moving.',
        held: 'They are still standing there an hour later, watching a path with nobody on it.',
        lost: 'Somebody puts a boot through the wrong thing and the whole wood hears it.',
        lostCon: 3,
      },
    ],
  },
  {
    id: 'stalker',
    name: 'Something following',
    zones: ['greywood'],
    nature: 'combat',
    weight: { day: 1, night: 5 },
    read: { skill: 'woodcraft', line: 'Everything that should be making noise on that side has stopped.' },
    xp: [18, 28],
    con: [-2, -1],
    body: ['[Placeholder Text]'],
    ways: [
      {
        text: 'Find it before it decides.',
        skill: 'perception',
        dc: 14,
        tried: 'The party stops moving and starts listening, which is the opposite of what it wants.',
        held: 'You see it before it means you to, and it goes back to being weather in the trees.',
        lost: 'The first anybody knows of it is the weight of it.',
        lostCon: 4,
      },
      {
        text: 'Put a fire between it and the party.',
        skill: 'woodcraft',
        dc: 14,
        tried: 'Dry standing wood, downwind, lit in a hurry and fed badly.',
        held: 'It will not come past the light. It follows the light instead, at a distance, until it stops following.',
        lost: 'The wood is wet through and the smoke goes the wrong way, and now it knows where you are as well.',
        spoils: { pitch: [0, 1] },
        lostCon: 4,
      },
    ],
  },
  {
    id: 'unquiet',
    name: 'Out of the ground',
    zones: ['greywood'],
    nature: 'combat',
    weight: { day: 1, night: 4 },
    read: { skill: 'perception', line: 'That earth has been turned, and it was turned from underneath.' },
    xp: [16, 24],
    con: [-2, -1],
    body: ['[Placeholder Text]'],
    ways: [
      {
        text: 'Notice it while it is still only turned earth.',
        skill: 'perception',
        dc: 15,
        tried: 'Everybody stands still and counts the mounds, twice.',
        held: 'The turned earth is noticed while it is still only turned earth.',
        lost: 'It is noticed afterwards, from the far side of it.',
        spoils: { nails: [0, 2] },
        lostCon: 4,
      },
      {
        text: 'Have iron in every hand before anything comes up.',
        skill: 'smithing',
        dc: 14,
        tried: 'Whatever is in the packs that is iron comes out of the packs.',
        held: 'It comes up into four edges and goes back down.',
        lost: 'Half of what came out of the packs was rust holding hands with rust.',
        spoils: { nails: [1, 3] },
        lostCon: 4,
      },
    ],
  },
];
