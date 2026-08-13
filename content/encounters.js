// What can be waiting at a node. A run draws from this table, so adding a kind here
// puts it into every quest without touching anything else.
//   id       — how src/run.js refers to it.
//   name     — shown at the top of the node.
//   nature   — gather, talk, combat, or hazard. Says what a run is likely to be made of
//              before you set out, and does one thing besides: a combat kind is drawn
//              only after dark, so a day run never puts one up whatever its weight says.
//   activity — the activity this node will become once that engine is imported. Until
//              then the node names it, pays out, and moves on.
//   weight   — how often it comes up by day and by night, relative to the other
//              weights. Nothing is ever zero: a night run still has timber in it. A
//              combat kind's day weight is never read, because nothing is fought by
//              daylight; leave it written for the day it is wanted.
//   read     — the skill that can spot this kind coming at a fork, and what they say.
//              A kind with no read is one nobody can see coming. Whoever has the most
//              points in it is the one who speaks.
//   harvest  — the skill this work is done with. Every point the walking party has in
//              it adds skillYieldPerPoint to the spoils, so who you take decides what
//              you carry home. A kind with no harvest pays the same to anybody.
//   check    — a roll against a difficulty, in the manner of the table: the party's
//              best at the skill rolls a die and adds their points, and needs the DC.
//              `held` and `lost` are the line said either way. What holding and losing
//              are worth is in tuning.js, not here.
//   spoils   — materials taken, [least, most] each. Rolled per node.
//   xp       — experience, [least, most].
//   con      — what it does to the party's constitution, [least, most]. Negative takes
//              and positive gives, so a spring or a dry barn can be written as a kind
//              that puts something back. Night multiplies what it takes; see tuning.js.
//   only     — true if this kind is never drawn at random and only turns up where a
//              quest's `line` names it. Authored nodes carry it; the road's own do not.
//   beats    — an encounter written out card by card instead of settled in one roll:
//              paragraphs, the choices the party gets, and the ways through. The shape
//              is documented on the one that has them. A kind without beats is a kind
//              the table resolves on its own, which is most of them.
//   body     — what the encounter is, in the world's voice. Yours to write.

export const ENCOUNTERS = [
  {
    id: 'woodland',
    name: 'Standing timber',
    nature: 'gather',
    activity: 'Felling',
    weight: { day: 5, night: 1 },
    read: { skill: 'woodcraft', line: 'Old cut stumps. Somebody worked this side, and there is more of it standing.' },
    harvest: 'woodcraft',
    check: {
      skill: 'woodcraft',
      dc: 12,
      held: 'It comes down where it was told to.',
      lost: 'It goes over the wrong way, takes a second tree with it, and most of the good wood is under both.',
    },
    spoils: { timber: [2, 4] },
    xp: [8, 14],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'crag',
    name: 'Broken crag',
    nature: 'gather',
    activity: 'Hauling',
    weight: { day: 4, night: 1 },
    read: null,
    harvest: 'smithing',
    check: {
      skill: 'smithing',
      dc: 12,
      held: 'The face splits where it was struck and the blocks come away square.',
      lost: 'The face shatters. What is left is rubble, and one of you was standing under it.',
    },
    spoils: { stone: [2, 4] },
    xp: [8, 14],
    con: [-2, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'animal',
    name: 'Something living',
    nature: 'gather',
    activity: 'Calming',
    weight: { day: 4, night: 3 },
    read: { skill: 'animalhandling', line: 'Tracks. Something came through here on four legs and was not hurrying.' },
    harvest: 'animalhandling',
    check: {
      skill: 'animalhandling',
      dc: 13,
      held: 'It stands still long enough to be worth the standing still.',
      lost: 'It bolts, and it does not bolt away from you first.',
    },
    // a cured hide is the same material as sailcloth to anyone patching a roof with it
    spoils: { canvas: [1, 2] },
    xp: [12, 20],
    con: [-2, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'wreck',
    name: 'Wreck on the shore',
    nature: 'gather',
    activity: 'Rigging',
    weight: { day: 3, night: 2 },
    read: { skill: 'sailing', line: 'The water runs wrong ahead. Something is aground on that side.' },
    harvest: 'sailing',
    check: {
      skill: 'sailing',
      dc: 13,
      held: 'She holds while you strip her.',
      lost: 'She shifts on the tide with the party still aboard her.',
    },
    spoils: { canvas: [1, 3], timber: [1, 2] },
    xp: [10, 18],
    con: [-2, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'water',
    name: 'Standing water',
    nature: 'gather',
    activity: 'Casting',
    weight: { day: 4, night: 2 },
    read: { skill: 'fishing', line: 'Rings on the surface, and they are not the rain. There is a lane feeding that way.' },
    harvest: 'fishing',
    check: {
      skill: 'fishing',
      dc: 11,
      held: 'The lane is where somebody said it was.',
      lost: 'An hour of wet standing for nothing, and the light going while you do it.',
    },
    spoils: { pitch: [1, 2] },
    xp: [10, 16],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'find',
    name: 'Left behind',
    nature: 'gather',
    activity: 'Searching',
    weight: { day: 3, night: 2 },
    read: { skill: 'perception', line: 'Something is stacked too neatly on that side to have got there by weather.' },
    harvest: 'perception',
    check: {
      skill: 'perception',
      dc: 10,
      held: 'The rest of it is under the sacking, where anybody would have put it.',
      lost: 'You take what is on top and walk past the rest without ever knowing it was there.',
    },
    spoils: { timber: [1, 2], nails: [1, 3] },
    xp: [6, 10],
    con: [0, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'oldiron',
    name: 'Iron in the ditch',
    nature: 'gather',
    activity: 'Salvage',
    weight: { day: 3, night: 2 },
    read: { skill: 'smithing', line: 'There is a cart axle in that ditch, and axles do not come out here on their own.' },
    harvest: 'smithing',
    check: {
      skill: 'smithing',
      dc: 12,
      held: 'Half of it is sound under the scale, and the sound half comes free.',
      lost: 'It is rust holding hands with rust. It comes apart in the lifting.',
    },
    spoils: { nails: [2, 5], stone: [0, 1] },
    xp: [10, 16],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'folk',
    name: 'Folk on the road',
    nature: 'talk',
    activity: 'Haggling',
    weight: { day: 5, night: 1 },
    read: { skill: 'charisma', line: 'Somebody has walked this recently and stopped to talk while they did.' },
    harvest: 'charisma',
    check: null,
    spoils: { nails: [2, 4] },
    xp: [10, 16],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'strangers',
    name: 'Strangers, and no lamp',
    nature: 'talk',
    activity: 'Persuasion',
    weight: { day: 2, night: 4 },
    read: { skill: 'charisma', line: 'Somebody stood here a while and did not want to be seen doing it.' },
    harvest: 'charisma',
    check: {
      skill: 'charisma',
      dc: 14,
      held: 'They decide, out loud, that you are nobody worth the trouble.',
      lost: 'They decide the other thing, and they decide it first.',
    },
    spoils: { nails: [1, 3] },
    xp: [12, 20],
    con: [-2, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'hazard',
    name: 'Bad ground',
    nature: 'hazard',
    activity: null,
    weight: { day: 2, night: 4 },
    read: null,
    harvest: null,
    check: {
      skill: 'perception',
      dc: 12,
      held: 'Somebody calls the halt a pace before it matters.',
      lost: 'Nobody calls anything, and the ground takes the first one across it.',
    },
    spoils: {},
    xp: [4, 8],
    con: [-3, -1],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'stalker',
    name: 'Something following',
    nature: 'combat',
    activity: 'Fighting',
    weight: { day: 1, night: 5 },
    read: { skill: 'animalhandling', line: 'Everything that should be making noise on that side has stopped.' },
    harvest: null,
    check: {
      skill: 'perception',
      dc: 14,
      held: 'You see it before it means you to, and it goes back to being weather in the trees.',
      lost: 'The first anybody knows of it is the weight of it.',
    },
    spoils: {},
    xp: [18, 28],
    con: [-4, -2],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'unquiet',
    name: 'Out of the ground',
    nature: 'combat',
    activity: 'Fighting',
    weight: { day: 1, night: 4 },
    read: null,
    harvest: null,
    check: {
      skill: 'perception',
      dc: 15,
      held: 'The turned earth is noticed while it is still only turned earth.',
      lost: 'It is noticed afterwards, from the far side of it.',
    },
    spoils: { nails: [0, 2] },
    xp: [16, 24],
    con: [-4, -1],
    body: ['[Placeholder Text]'],
  },

  // --- authored: the first job ------------------------------------------------
  // Named by firstday's `line` in content/quests.js and drawn by nothing else. The two
  // check events and the plot event are placeholders for the designer to write; the
  // shape they need is here, the words are not.

  {
    // The first node of the first job: water before timber. `Casting` is the three-phase
    // fishing act imported from StarScape — cast, hook, reel — and the rod is the test
    // here rather than a roll. See src/minigames/FishEngine.js.
    id: 'firstcast',
    name: '[Placeholder — the fishing node]',
    nature: 'gather',
    activity: 'Casting',
    only: true,
    weight: { day: 0, night: 0 },
    read: { skill: 'fishing', line: '[Placeholder Text]' },
    harvest: 'fishing',
    check: null, // the rod is the test here, not a roll
    spoils: { provisions: [3, 5] },
    xp: [12, 18],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
  },
  {
    // The Woodcraft way through the fork. Written out beat by beat rather than settled
    // in one roll: see `beats` below, and src/run.js for what plays them.
    id: 'heron',
    name: "The heron's nest",
    nature: 'gather',
    activity: null,
    only: true,
    weight: { day: 0, night: 0 },
    read: { skill: 'woodcraft', line: '[Placeholder Text]' },
    harvest: 'animalhandling',
    check: null, // the beats carry their own rolls, one per way in
    spoils: {}, // and their own spoils: nothing is taken off this by walking past it
    xp: [10, 16],
    con: [0, 0],
    body: ['[Placeholder Text]'],

    // A beat is a card. `text` is what is on it — a string is narration, { cry } is a
    // noise the bird makes. `then` is the next beat, `toss` is two of them and a coin,
    // `result` reads back the roll made on the way in, and `choose` hands it to the
    // player. `spoils`, `con` and `flag` are what walking through this beat did. A beat
    // with no way on is the end of the encounter.
    beats: [
      {
        id: 'alders',
        text: [
          "The trees ahead are dead alders. Bare, grey, standing in water that doesn't move.",
          'You smell it before you see it — fish, old fish, and something turning underneath that.',
        ],
        then: 'nest',
      },
      {
        id: 'nest',
        text: [
          'The nest is wedged in the fork of the tallest of them. Branches as thick as your forearm, woven through with weed and packed with mud.',
          'It is bigger than a cart.',
        ],
        then: 'bird',
      },
      {
        id: 'bird',
        text: [
          'The heron is not in it.',
          "It's on the ground beneath, standing in the shallows with its wings half-open and its head down level with its shoulders. It has been watching you since before you saw it.",
        ],
        then: 'skree',
      },
      {
        id: 'skree',
        text: [
          { cry: 'SKREEEE!!!' },
          '[Placeholder Text]', // companion bark — the size of the bird, or a warning
        ],
        then: 'ways',
      },
      {
        id: 'ways',
        choose: [
          {
            text: '[Approach slowly and try to settle it.]',
            skill: 'woodcraft',
            dc: 15,
            then: 'settling',
          },
          {
            text: "[Hold back and work out what's wrong with it.]",
            skill: 'perception',
            dc: 10,
            then: 'watching',
          },
          {
            text: '[Skirt the water and keep moving.]',
            then: 'skirting',
          },
        ],
      },

      // the Woodcraft way
      {
        id: 'settling',
        text: [
          "{skillActor} goes ahead of the party. Low, slow, hands open and out where the bird can see they're empty.",
          '{skillActor} comes at an angle rather than straight on — the way you come at anything that has already decided you are the problem.',
          { cry: 'Tk-tk-tk. Tk-tk-tk-tk.' },
          { cry: 'Rrrrrrhh.' },
          "The clattering stops. What replaces it is lower, and comes from much further down, and it doesn't stop while {skillActor} is moving.",
        ],
        result: { hit: 'settled', miss: 'misjudged' },
      },
      {
        id: 'settled',
        text: [
          { cry: 'Hnnh.' },
          'The sound thins. Goes ragged at the end of it. The wings fold. It shifts its weight, steps sideways out of the shallows, and lets the party past.',
        ],
        then: 'secondbird',
      },
      {
        id: 'secondbird',
        text: [
          "Past the trunk, back in the reeds, is the second bird. Three arrows in it, set low on the body, where they wouldn't spoil the plumage.",
        ],
        spoils: { canvas: [1, 2] },
        flag: 'poacher-clue', // somebody is shooting the Greywood for feathers
        then: 'notfollowed',
      },
      {
        id: 'notfollowed',
        text: [
          { cry: 'Kraa.' },
          "The heron doesn't follow you out.",
        ],
      },
      {
        id: 'misjudged',
        text: ['{skillActor} misjudges it. One step too many, or one step too quick.'],
        then: 'provoked',
      },

      // the Perception way
      {
        id: 'watching',
        text: ['{skillActor} stops the party at the treeline and watches instead.'],
        result: { hit: 'shells', miss: 'tooslow' },
      },
      {
        id: 'shells',
        text: ['{skillActor} tips {their} chin at the near side of the nest.'],
        then: 'counting',
      },
      {
        id: 'counting',
        text: [
          "It's torn open. And below it, shells broken open.",
          'Pale green, thick as a thumbnail, scattered across the ground. Empty.',
          'You count four before you stop counting.',
        ],
        then: 'realising',
      },
      {
        id: 'realising',
        text: [
          { cry: 'Skreeeeeeee—' },
          '[Placeholder Text]', // companion bark — the realisation
        ],
        then: 'northward',
      },
      {
        id: 'northward',
        text: [
          'The bird hauls itself up out of the water and takes flight north over the treeline.',
          "It doesn't look back.",
        ],
        spoils: { timber: [1, 2] }, // the nest is a cartload of branches and nobody is coming back for it
      },
      {
        id: 'tooslow',
        text: ['{skillActor} is still working it out when the bird decides the party has been standing there long enough.'],
        then: 'provoked',
      },

      // the way past, and where all three failures end up
      {
        id: 'skirting',
        text: [
          'You keep to the far edge of the water. Slow, eyes down, nothing sudden.',
          "You're almost past when it moves.",
        ],
        then: 'provoked',
      },
      {
        id: 'provoked',
        text: [
          "The bird's wings come all the way out. Six feet. Seven. The bird is suddenly the largest thing in the clearing.",
          { cry: 'RRRRAAAHHHHH—' },
        ],
        toss: ['attacks', 'holds'],
      },
      {
        id: 'attacks',
        text: [
          { cry: 'FRAWNK!' },
          'It crosses the water in two strides and it is faster than anything that size.',
        ],
        con: -4, // what it costs. Flat, like every other number in this table.
      },
      {
        id: 'holds',
        text: [
          'It steps back. It puts itself between you and the tree, and it stays there until you are past the alders and gone.',
        ],
      },
    ],
  },
  {
    // The other way through the fork, written out the same way. Both ways can turn up
    // the same poacher: grey feathers under the bank here, a shot bird in the reeds
    // there, and the one flag either of them raises.
    id: 'mushrooms',
    name: 'The mushroom copse',
    nature: 'gather',
    activity: null,
    only: true,
    weight: { day: 0, night: 0 },
    read: { skill: 'alchemy', line: '[Placeholder Text]' },
    harvest: 'alchemy',
    check: null, // the beats carry their own rolls, one per way in
    spoils: {}, // and their own spoils: the hollow gives up nothing to walking past it
    xp: [10, 16],
    con: [0, 0],
    body: ['[Placeholder Text]'],

    beats: [
      {
        id: 'hollow',
        text: [
          'The path drops into a hollow where the light goes green and stops moving.',
          'A fallen oak lies across it, half sunk into the leaf mould, and the whole length of it is furred with mushrooms.',
        ],
        then: 'crowded',
      },
      {
        id: 'crowded',
        text: [
          "Hundreds. Pale caps the size of a fist, crowded so close along the trunk that there's no bark left showing.",
          '[Placeholder Text]', // companion bark — recognition, or appetite
        ],
        then: 'ways',
      },
      {
        id: 'ways',
        choose: [
          {
            text: '[Sort the good from the bad.]',
            skill: 'alchemy',
            dc: 15,
            then: 'cutting',
          },
          {
            text: '[Read the ground around the hollow.]',
            skill: 'woodcraft',
            dc: 10,
            then: 'rim',
          },
          {
            text: '[Leave them where they are.]',
            then: 'past',
          },
        ],
      },

      // the Alchemy way
      {
        id: 'cutting',
        text: [
          '{skillActor} kneels into the mould and starts cutting stems.',
          'Every cut gets turned to the light and watched.',
        ],
        result: { hit: 'sorted', miss: 'blistered' },
      },
      {
        id: 'sorted',
        text: [
          'The cut flesh bruises blue on some of them.',
          '{skillActor} takes the ones that stay white, and buries the rest deep enough that nothing else finds them.',
        ],
        spoils: { pitch: [2, 3] },
      },
      {
        id: 'blistered',
        text: [
          "{skillActor} cuts, and watches, and can't see it. The light down here is green and everything already looks dark.",
          'They throw the mushroom away, just to be certain.',
          "As you proceed back down the path, it does not take long before {skillActor}'s hands are covered in ugly purple bumps.",
        ],
        con: -3, // what it costs. Flat, like every other number in this table.
      },

      // the Woodcraft way
      {
        id: 'rim',
        text: ['{skillActor} leaves the trunk alone and walks the rim of the hollow instead.'],
        result: { hit: 'snare', miss: 'wire' },
      },
      {
        id: 'snare',
        text: [
          'The mould has been walked on. Not by deer.',
          'Twenty feet in, a snare line strung between two saplings at knee height. It has been there long enough to rust.',
          "There's a cold fire under the bank, and beside it a bundle of feathers, trimmed at the quill and tied off.",
          'Grey, most of them.',
          '[Placeholder Text]', // companion bark — the realisation
        ],
        spoils: { nails: [2, 4] },
        flag: 'poacher-clue', // the same clue the heron's second bird raises
      },
      {
        id: 'wire',
        text: [
          '{skillActor} walks the rim and comes back with a coil of wire and a broken arrow.',
          "A broken arrow tells you somebody stood here. It doesn't tell you when, or how many, or what for.",
        ],
        spoils: { nails: [1, 2] }, // salvage, and nothing to make of it
      },

      // and the way past
      {
        id: 'past',
        text: [
          'You keep to the path and leave the hollow to itself.',
          'The light stays green until the ground comes back up.',
        ],
      },
    ],
  },
  {
    id: 'secondcut',
    name: 'The second stand',
    nature: 'gather',
    activity: 'Felling',
    only: true,
    weight: { day: 0, night: 0 },
    read: { skill: 'woodcutting', line: 'The same again, and the light going.' },
    harvest: 'woodcutting',
    check: null,
    spoils: { timber: [3, 5] },
    xp: [12, 18],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
  },
  {
    // Where the job ends. A plot node: Aldis is the only one who speaks, nothing is
    // rolled, and it plays straight through to the road home. `{ who, line }` in a
    // beat's text is somebody saying it; the rest is what the two of them are looking at.
    id: 'aldiswood',
    name: 'The grove',
    nature: 'talk',
    activity: null,
    only: true,
    weight: { day: 0, night: 0 },
    read: null,
    harvest: null,
    check: null, // and the job's own roll was taken out of it; see content/quests.js
    spoils: {},
    xp: [20, 20],
    con: [0, 0],
    body: ['[Placeholder Text]'],

    beats: [
      {
        id: 'stench',
        text: [
          { who: 'aldis', line: 'That stench.' }, // stopping
          { who: 'aldis', line: "Breathe through your mouth. It doesn't help much, but it helps." },
        ],
        then: 'before',
      },
      {
        id: 'before',
        text: [{ who: 'aldis', line: "I've smelled this before. Never this strong." }],
        then: 'stag',
      },
      {
        id: 'stag',
        text: [
          'A red stag. Fourteen points, maybe more. Hard to count now.',
          'There are arrows in it. Six at the shoulder and the flank, one low in the neck.',
          'The fletching is grey.',
          { who: 'aldis', line: 'There they are.' }, // quietly
          { who: 'aldis', line: "Seven shots to put it down. That isn't skill. That's overkill." },
        ],
        then: 'wrong',
      },
      {
        id: 'wrong',
        text: [
          'The body is wrong.',
          'The spine has been turned somewhere a spine does not turn. The hindquarters face away from the shoulders. The ribs stand open, and they were opened from the inside.',
          { who: 'aldis', line: "Nothing eats like this. This wasn't a hunt." },
        ],
        then: 'beetles',
      },
      {
        id: 'beetles',
        text: [
          'Something moves in the eye socket.',
          'Then the mouth. Then the whole open length of the flank, all at once.',
          'Beetles. Black, thumbnail-sized, coming out of the animal in a steady unbroken pour, over the antlers and down into the moss.',
          { who: 'aldis', line: '[Placeholder Text]' }, // his line here was left blank
        ],
        then: 'everyway',
      },
      {
        id: 'everyway',
        text: [
          { who: 'aldis', line: "I've walked these woods since I could walk." },
          { who: 'aldis', line: 'I know every way a thing dies out here. I know the wolf kills. I know the winter kills. I know the ones that just lie down under a tree because they\'re finished.' },
          { who: 'aldis', line: "I don't know this one." },
        ],
        then: 'sevenarrows',
      },
      {
        id: 'sevenarrows',
        text: [
          { who: 'aldis', line: "The men who shot this stood where we're standing." },
          { who: 'aldis', line: "Seven arrows into it, and then they didn't take one thing off the body. Not the antlers. Not the hide. Not a strip of it." },
        ],
        then: 'wheretheywent', // the beat before the question is the press that gets to it
      },
      {
        id: 'wheretheywent',
        text: [{ who: 'aldis', line: 'So where did they go?' }],
        then: 'gregorious',
      },
      {
        id: 'gregorious',
        text: [
          { who: 'aldis', line: "Let's head back to Gregorious. He's been here longest." },
          { who: 'aldis', line: "If he doesn't know what that was, nobody in Dreadhollow does." },
        ],
        then: 'lightgoing',
      },
      {
        id: 'lightgoing',
        text: [
          { who: 'aldis', line: 'Every time I say this place will come back… it gets a little worse.' },
          { who: 'aldis', line: "It's getting dark. We should get going…" },
        ],
      },
    ],
  },
];
