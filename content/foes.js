// What is fought after dark, and what a fighter can do about it. Two tables and nothing
// else: the things on the road, and the three moves anybody swinging at them has.
//
// A fight is 1v1 and turn-based. One combat character steps up — see `combat` in
// content/party.js — and trades blows with one foe until one of them is down. Every blow
// is the same roll the rest of the game makes: a d20, plus what the swinger is worth,
// against what the other one's guard is. A natural 20 always lands and a natural 1 never
// does, so no guard is a wall and none is a formality.
//
// Where a node names a band rather than one thing, it is still 1v1: theirs come forward
// one at a time and send the next up the moment the one in front goes down, the same way
// yours do. Four a side is the most either side can be; see partyMax in tuning.js. A band
// of three weak things is not three times the fight — it is three times as long, and
// length is what a fighter's hit points are actually spent on.
//
// Either side can leave. Badly hurt, the party can try to break off and so can anything
// written to look after itself: it costs whoever tries it the turn, it is a bare d20, and
// a fight walked away from pays only for what was put down before the running started.
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
//   pulls  — true if it looks after itself. Badly hurt, it pulls back out of the front
//            behind something fresher; badly hurt with nothing to hide behind, it tries
//            to leave the fight altogether. Either costs them the blow they were going to
//            throw and hands the party an opening, and going is not guaranteed — see
//            badlyHurt and fleeDC in tuning.js. What pulled back comes forward again later
//            as hurt as it went; what got away is gone, and pays nothing. Leave it out for
//            anything that does not know how to do that, or will not: it is the whole
//            difference between men and dogs working together and a thing that comes on
//            until it stops.
//   body   — what it is, said once when it comes on.
//   lands  — what it looks like when its blow goes in.
//   misses — and when it does not.
//   felled — and when it goes down.
// The lines are picked from at random, so write two or three of each and the same fight
// does not read the same twice.
//
// A MOVE. These are the party's, and only the party's: a foe throws its one blow with the
// numbers on its own block, and picking a move the way the party does is not written yet.
//   id     — how src/combat.js refers to it.
//   name   — shown on the card.
//   play   — the activity the move is, from src/activity.js. Taking it hands the player
//            the controls the same way a piece of work does, and how well it is played is
//            what the blow is worth: full harm at perfect and down to harmFloor at worst,
//            with the same fraction added to the roll to land it. A move naming nothing —
//            or naming an activity with no engine yet — is resolved on the roll alone.
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
// A fourth row turns up under them on its own where the run has another fighter still on
// their feet: changing over to them. It is not written here because it is not a move — it
// is the turn spent on somebody else taking the front. See swapOpens in tuning.js.

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
    hp: 15, // slow and hard to hurt, and there is rarely only one
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
    pulls: true, // he has done this before, and he did not get old out here by standing still
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
  {
    // What the poachers keep, and the reason a fire out here is not one man on his own.
    // Quick, hard to catch and made of paper: the fight it makes is the turns it costs.
    id: 'lurcher',
    name: 'The lurcher',
    hp: 8,
    hit: 4,
    guard: 13,
    harm: [2, 4],
    pulls: true, // it is worked to a whistle, and the whistle knows what a hurt dog is worth
    spoils: { canvas: [0, 1], bone: [1, 2] },
    body: [
      'A long grey dog comes off the picket at the edge of the firelight, low and silent, and it was silent the whole time you were walking up.',
    ],
    lands: [
      'It has the forearm and it does not shake — it just leans back and puts its weight into keeping it.',
      'It comes in under the swing and off again, and you are bleeding before you have finished turning.',
    ],
    misses: [
      'It breaks off short of you, circles wide, and comes back the other way.',
      'It feints in and out again, and it is only ever where you are not.',
    ],
    felled: [
      'It goes down in the leaf litter and lies still, and something about the quiet of it is worse than the noise was.',
    ],
  },
];

export const MOVES = [
  {
    id: 'strike',
    name: 'Strike',
    play: 'Swing', // the axe, one swing of it
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
    play: 'Drive', // the pick: a shallow-or-deep dial on top of the swing, which is the greed
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
    play: 'Cover', // a hold against a drifting band: the same thing a guard is
    line: 'No swing. Take the weight of the next one and find your feet.',
    hit: 0,
    harm: 0, // a turn spent not swinging
    opens: 0,
    keep: 0.35,
    steady: 4,
  },
];
