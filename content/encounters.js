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
//   harvest  — the skill this work is done with, and the gate on it. A party with no
//              points in it at all cannot work the node: they walk past, and it is not
//              rolled, played or paid. With a point or more, every one of them adds
//              skillYieldPerPoint to what comes off it, so who you take decides both
//              whether you can do the work and what you carry home from it. A kind with
//              no harvest is open to anybody and pays them all the same.
//              A kind whose beats hand the party a choice is exempt: that is a scene
//              rather than a job, so it plays, and the ways through it that name a
//              skill nobody has are what close instead. Write one way needing nothing
//              and there is always a way out of a scene.
//   check    — a roll against a difficulty, in the manner of the table: the party's
//              best at the skill rolls a die and adds their points, and needs the DC.
//              `held` and `lost` are the line said either way. What holding and losing
//              are worth is in tuning.js, not here.
//   spoils   — materials taken, [least, most] each. Rolled per node. A node that always
//              hands over the same things names them here.
//   draw     — a yield drawn rather than listed, for a node where what you get is a
//              question of luck: `count` things come off it, [least, most], and each one
//              of them is drawn against `odds`. Odds are drop rates written the way a
//              designer says them — 50, 30, 20 — and are read against each other, so
//              they need not add up to a hundred. What is written here is the base rate,
//              which is what a party who knows nothing about the work would see. Points
//              in `harvest` do two things to it: more draws, and a table bent toward its
//              scarce end. The bend never reorders a table — the common row stays the
//              common one — and an even table is left even. See tuning.js.
//   xp       — experience, [least, most].
//   con      — what it does to the party's constitution, [least, most]. Negative takes
//              and positive gives, so a spring or a dry barn can be written as a kind
//              that puts something back. Night multiplies what it takes; see tuning.js.
//   only     — true if this kind is never drawn at random and only turns up where a
//              quest's `line` names it. Authored nodes carry it; the road's own do not.
//   beats    — an encounter written out card by card instead of settled in one roll:
//              paragraphs, the choices the party gets, and the ways through. The shape
//              is documented on the one that has them. A kind without beats is a kind
//              the table resolves on its own, which is most of them. A kind with beats
//              AND an activity plays the beats first and hands over the controls when
//              they run out — words in front of a minigame.
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
    read: { skill: 'woodcraft', line: 'Tracks. Something came through here on four legs and was not hurrying.' },
    harvest: 'woodcraft',
    check: {
      skill: 'woodcraft',
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
    read: { skill: 'woodcraft', line: 'Everything that should be making noise on that side has stopped.' },
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
    //
    // Its beats are the walk up to the water. A node with both beats and an activity
    // plays the beats first and hands over the controls when they run out, so the stream
    // is read before anybody casts into it.
    id: 'firstcast',
    name: 'The stream',
    nature: 'gather',
    activity: 'Casting',
    only: true,
    weight: { day: 0, night: 0 },
    read: null, // never a fork, so nothing is ever said about it on the way in
    harvest: 'fishing',
    check: null, // the rod is the test here, not a roll
    spoils: {},
    // The Greywood's water, at the base rates. One fish is what a cast is worth to
    // somebody with a single point of Fishing on it; everything above that is what the
    // party knows and how the rod was worked, both of them in `take` in src/run.js. A
    // cast worked badly usually comes home with nothing, and a botched one nearly always.
    draw: { count: [1, 1], odds: { bluegill: 50, perch: 30, brooktrout: 20 } },
    xp: [12, 18],
    con: [-1, 0],
    body: ['[Placeholder Text]'],

    beats: [
      {
        id: 'water',
        text: [
          'The trees give out onto water. A stream, wide and shallow and peat-brown.',
          "It's slow enough that you have to watch a leaf a while to be sure which way it's going.",
          'Skaters and flies ripple on the surface. Cast a line?',
        ],
      },
    ],
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
    harvest: 'woodcraft',
    check: null, // the beats carry their own rolls, one per way in
    spoils: {}, // and their own spoils: nothing is taken off this by walking past it
    xp: [10, 16],
    con: [0, 0],
    body: ['[Placeholder Text]'],

    // A beat is a card. `text` is what is on it — a string is narration, { cry } is a
    // noise the bird makes. `then` is the next beat, `toss` is two of them and a coin,
    // `result` reads back the roll made on the way in, and `choose` hands it to the
    // player. `spoils`, `con` and `flag` are what walking through this beat did, and
    // `leaves` says that this is the beat where whatever is standing on the road stops
    // being there — the same change of state a felled tree makes, said in words rather
    // than earned with an axe. A beat with no way on is the end of the encounter. A beat can carry a `draw` table as
    // well, for a way through whose yield is luck rather than a settled thing; the nest
    // below has none, because what it gives up is decided by which way you came at it.
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
        // the plumage the poacher was shooting for, and the arrows they left in it
        spoils: { heronfeather: [2, 4], greyarrow: [1, 3] },
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
        spoils: { eggshell: [2, 4] }, // as many as anybody stayed long enough to pick up
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
        leaves: true, // the only way through it where the bird actually goes
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
        // the pale caps off the trunk, and the black ones nobody sees who isn't looking:
        // an even split, so a good cut is as likely to be one as the other
        draw: { count: [3, 5], odds: { oystermushroom: 50, blacktrumpet: 50 } },
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
    // The timber the job was taken for. Beats first, then the axe: the tree is read
    // before it is cut, the same way the stream is read before anybody casts into it.
    id: 'secondcut',
    name: 'The oak',
    nature: 'gather',
    activity: 'Felling',
    only: true,
    weight: { day: 0, night: 0 },
    read: null, // never a fork, so nothing is ever said about it on the way in
    harvest: 'woodcutting',
    check: null,
    spoils: {},
    // The tree, broken up, at the Greywood's base rates: mostly limb wood off the
    // storm-torn shoulder, sometimes trunk wood, and now and then the sound dark core
    // the beat below is looking at when it says so.
    draw: { count: [3, 5], odds: { oakbranch: 50, oaklog: 30, heartwood: 20 } },
    xp: [12, 18],
    con: [-1, 0],
    body: ['[Placeholder Text]'],

    beats: [
      {
        id: 'oak',
        text: [
          'The oak stands alone in a clearing it made for itself. Nothing else has been allowed to get tall within thirty feet of it.',
          'One limb is down — old, storm-torn, half sunk into the ground and still attached at the shoulder.',
          'The heartwood in the break is dark and dry and sound.',
          'Fell the oak?',
        ],
      },
    ],
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
