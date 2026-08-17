// What is fought after dark, and what a fighter can do about it. Two tables and nothing
// else: the things on the road, and the three moves anybody swinging at them has.
//
// A fight is 1v1 and turn-based. One combat character steps up — see `combat` in
// content/party.js — and trades blows with one foe until one of them is down. Every blow
// is the same roll the rest of the game makes: a d20, plus what the swinger is worth,
// against what the other one's guard is. A natural 20 always lands and a natural 1 never
// does, so no guard is a wall and none is a formality.
//
// A FOE:
//   id     — how content/nodes.js names it, on the node that fights it.
//   name   — shown over its side of the fight.
//   hp     — how much it takes to put down.
//   hit    — what it adds to its own d20.
//   guard  — what a swing at it has to beat.
//   harm   — what one of its blows takes off a fighter, [least, most].
//   spoils — what is taken off it once it is down, [least, most] each. A fight that pays
//            nothing is a fight nobody had a reason to pick, so everything here pays.
//   body   — what it is, said once when it comes on.
//   lands  — what it looks like when its blow goes in.
//   misses — and when it does not.
//   felled — and when it goes down.
// The lines are picked from at random, so write two or three of each and the same fight
// does not read the same twice.
//
// A MOVE:
//   id     — how src/combat.js refers to it.
//   name   — shown on the card.
//   line   — one line under it: what taking it costs, in words rather than numbers. The
//            numbers are on the card underneath, off the fields below.
//   hit    — added to this swing's d20.
//   harm   — what this swing does to the damage rolled, as a multiplier. Zero is a move
//            that does not swing at all.
//   opens  — what the foe adds to its answering d20 for having been given the opening.
//   keep   — what is left of the foe's answering blow after this move takes the weight
//            of it. One is the whole of it.
//   steady — added to the next swing, for a turn spent not taking one.
// Three moves is the whole list on purpose: a fight is a question asked eight times, and
// a question with three answers is one a player can hold in their head. Add a fourth when
// a foe is written that makes one of these three the wrong answer.

export const FOES = [
  {
    id: 'stalker',
    name: 'The thing that was following',
    hp: 20,
    hit: 4,
    guard: 14, // fast, and hard to put a hand on
    harm: [3, 6],
    spoils: { canvas: [1, 3], bone: [1, 2] },
    body: [
      'It comes out of the quiet all at once and low to the ground, and it is the wrong shape the whole way in.',
    ],
    lands: [
      'It is inside your reach before the swing is finished and it opens you along the ribs.',
      'It takes the arm and drags, and what it wants is the ground.',
    ],
    misses: [
      'It comes and goes again and there is nothing there to hit.',
      'It breaks off a foot short, wide of you, and circles.',
    ],
    felled: [
      'It goes over sideways and does not get up, and whatever it is looks smaller lying down.',
    ],
  },
  {
    id: 'unquiet',
    name: 'What came up out of the ground',
    hp: 26, // slow, and it takes a lot of putting back down
    hit: 2,
    guard: 10,
    harm: [2, 5],
    spoils: { nails: [2, 4], bone: [2, 3] },
    body: [
      'The nearest mound comes apart and what is under it stands up in the earth it was buried in, and it is in no hurry at all.',
    ],
    lands: [
      'It gets both hands into your coat and its weight is all wrong for its size.',
      'It comes down on you the way a fence post comes down, and about as fast.',
    ],
    misses: [
      'It swings where you were standing, and it was slow enough to read.',
      'It goes past you into the dark and turns around, unhurried.',
    ],
    felled: [
      'You take the legs out from under it and it goes back down into the turned earth, and it stays there.',
    ],
  },
  {
    id: 'poacher',
    name: 'The man with the grey arrows',
    hp: 18,
    hit: 3,
    guard: 12,
    harm: [3, 5],
    // the fletching from the heron and the stag, on the man who has been leaving it
    spoils: { greyarrow: [2, 5], nails: [1, 2] },
    body: [
      'He does not run and he does not talk. He puts the bow down where he can reach it again and comes at you with what is on his belt.',
    ],
    lands: [
      'He knows exactly what he is doing with it, which is somehow the worst part.',
      'He goes for the inside of the arm, twice, and gets it the second time.',
    ],
    misses: [
      'He is a hand short and takes the miss back with him rather than following it.',
      'You turn it on your forearm and it costs you nothing but the shirt.',
    ],
    felled: [
      'He sits down hard against the trunk behind him, and after a moment he stops holding the knife.',
    ],
  },
];

export const MOVES = [
  {
    id: 'strike',
    name: 'Strike',
    line: 'A blow you can take back if it misses.',
    hit: 0,
    harm: 1,
    opens: 0,
    keep: 1,
    steady: 0,
  },
  {
    id: 'press',
    name: 'Press it',
    line: 'Everything behind it, and nothing left over to cover you.',
    hit: 1,
    harm: 1.7,
    opens: 4, // it gets to answer into the gap you left
    keep: 1,
    steady: 0,
  },
  {
    id: 'guard',
    name: 'Guard',
    line: 'No swing. Take the weight of the next one and find your feet.',
    hit: 0,
    harm: 0, // a turn spent not swinging
    opens: 0,
    keep: 0.35,
    steady: 4,
  },
];
