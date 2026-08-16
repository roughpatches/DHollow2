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
//   d20 check, and the party takes one of them. A run only ever has one of each: the
//   same thing happening twice on one walk out reads as the road running short.
//
// The two kinds ask for two different halves of content/skills.js, and that is the whole
// difference between them:
//   A harvest names a GATHERING skill and nothing else — Woodcutting, Fishing, Mining,
//   Herblore — and its activity is the StarScape engine that work is. src/run.js says so
//   at boot if a harvest names anything outside that group. Herblore's engine is still
//   being built, so a Foraging node names it, pays out and moves on until it lands.
//   A way through an encounter names ANY skill, gathering included. It is a roll against
//   a DC and not a piece of work, so nothing has to have an engine behind it.
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
//   harvests — one or two of them. Each names the gathering skill the work is done with,
//             the activity that work is, and what comes off it: `spoils` for a fixed
//             list, [least, most] each, and `draw` for a yield that is a question of
//             luck — `count` things come off it, each one drawn against `odds`. Odds are
//             read against each other and need not add up to a hundred. Points in the
//             skill take more off it and bend the table toward its scarce end; see
//             tuning.js. Write two of them and the node becomes a question the party is
//             asked where they stand, so write two the same crew would want differently
//             — not two spellings of one job.
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
        // The other thing standing here, and nothing to do with the first: what grows on
        // the dead wood at the foot of a stand nobody has cleared in twenty years.
        skill: 'herblore',
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
        skill: 'herblore',
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
        // The bank rather than the water: what grows where the light gets in and the
        // ground never dries out.
        skill: 'herblore',
        activity: 'Foraging',
        draw: { count: [1, 2], odds: { blacktrumpet: 45, oystermushroom: 20 } },
      },
    ],
    xp: [10, 16],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'shallows',
    name: 'Gravel shallows',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 3, night: 2 },
    read: { skill: 'fishing', line: 'It runs thin and quick over stone there. Everything in that water has to come through it.' },
    harvests: [
      {
        skill: 'fishing',
        activity: 'Casting',
        draw: { count: [1, 3], odds: { brooktrout: 50, perch: 25 } },
      },
      {
        // The same gravel, read the other way: what a stream has been carrying down off
        // whatever it comes out of.
        skill: 'mining',
        activity: 'Panning',
        draw: { count: [1, 3], odds: { ironore: 40, stone: 35, roughgem: 6 } },
      },
    ],
    xp: [10, 16],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
  },
  {
    // The one node the crew you can actually put together at the start is asked a real
    // question by: both halves of it are work somebody in Dreadhollow already knows.
    id: 'logjam',
    name: 'A jam in the narrows',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 4, night: 2 },
    read: { skill: 'woodcutting', line: 'Half a winter of deadfall stacked up against that narrows, and the water going round it.' },
    harvests: [
      {
        skill: 'woodcutting',
        activity: 'Sawing',
        spoils: { timber: [2, 4] },
        draw: { count: [1, 2], odds: { oaklog: 45, oakbranch: 35 } },
      },
      {
        // Everything in the stream has been backing up behind it since the autumn.
        skill: 'fishing',
        activity: 'Casting',
        draw: { count: [2, 4], odds: { perch: 45, bluegill: 35, brooktrout: 25 } },
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
    read: { skill: 'mining', line: 'The face on that outcrop is fresh. It has come away square before and it will again.' },
    harvests: [
      {
        skill: 'mining',
        activity: 'Quarrying',
        spoils: { stone: [2, 4] },
        draw: { count: [0, 2], odds: { ironore: 40, roughgem: 8 } },
      },
    ],
    xp: [8, 14],
    con: [-2, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'seam',
    name: 'A seam in the cut bank',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 3, night: 2 },
    read: { skill: 'investigation', line: 'The bank has come away there, and what is behind it is not more bank.' },
    harvests: [
      {
        skill: 'mining',
        activity: 'Quarrying',
        draw: { count: [1, 3], odds: { ironore: 50, stone: 30, roughgem: 10 } },
      },
      {
        skill: 'herblore',
        activity: 'Foraging',
        draw: { count: [1, 2], odds: { blacktrumpet: 35, oystermushroom: 25 } },
      },
    ],
    xp: [10, 16],
    con: [-1, 0],
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
    read: { skill: 'investigation', line: 'The path ahead is holding water it has no business holding.' },
    xp: [4, 8],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
    ways: [
      {
        text: 'Call the halt and sound it before anybody crosses.',
        skill: 'investigation',
        dc: 12,
        tried: 'The party stops where they are told to stop, and a stick goes in ahead of a boot.',
        held: 'Somebody calls the halt a pace before it matters.',
        lost: 'Nobody calls anything, and the ground takes the first one across it.',
        con: 1,
        lostCon: 3,
      },
      {
        text: 'Find the line across it that will take a boot.',
        skill: 'fording',
        dc: 12,
        tried: 'Reading the ground the way you would read water: for what is under it, not what is on it.',
        held: 'There is a line. It is nothing like the line it looks like, and it holds all four of you.',
        lost: 'The line runs out halfway along and the party finds that out standing on it.',
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
    read: { skill: 'fording', line: 'That is standing water with a current under it. It goes somewhere.' },
    xp: [6, 12],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
    ways: [
      {
        text: 'Cross where it is running, because running water has a bottom.',
        skill: 'fording',
        dc: 13,
        tried: 'The party goes in where the surface is moving, one at a time, roped to the one behind.',
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
    read: { skill: 'persuasion', line: 'Somebody has walked this recently and stopped to talk while they did.' },
    xp: [10, 16],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
    ways: [
      {
        text: 'Trade with them.',
        skill: 'persuasion',
        dc: 12,
        tried: 'Nobody names a price first, which is the whole of the game.',
        held: 'They name it first, and it is a good deal better than the one you were going to name.',
        lost: 'You name it first.',
        spoils: { nails: [2, 4] },
        lostCon: 1,
      },
      {
        text: 'Listen to what they are not saying.',
        skill: 'insight',
        dc: 12,
        tried: 'Two of them talking and one of them doing all of it.',
        held: 'The quiet one has come from somewhere with cut stone in it, and the talker says where without being asked.',
        lost: 'They are pleasant, and they are pleasant the whole way through, and you learn nothing at all.',
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
    read: { skill: 'insight', line: 'Somebody stood here a while and did not want to be seen doing it.' },
    xp: [12, 20],
    con: [-2, 0],
    body: ['[Placeholder Text]'],
    ways: [
      {
        text: 'Talk past them.',
        skill: 'persuasion',
        dc: 14,
        tried: 'Loudly, and about nothing, and without ever stopping walking.',
        held: 'They decide, out loud, that you are nobody worth the trouble.',
        lost: 'They decide the other thing, and they decide it first.',
        spoils: { nails: [1, 3] },
        lostCon: 3,
      },
      {
        text: 'Make it clear what it would cost them.',
        skill: 'intimidation',
        dc: 13,
        tried: 'Nobody says anything. Everybody stops walking at the same time, which says it.',
        held: 'They find somewhere else to be standing, and they find it quickly.',
        lost: 'There are more of them off the path than there were on it, and now they know that you know.',
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
        skill: 'woodcraft',
        dc: 14,
        tried: 'The party stops moving and starts listening, which is the opposite of what it wants.',
        held: 'You see it before it means you to, and it goes back to being weather in the trees.',
        lost: 'The first anybody knows of it is the weight of it.',
        lostCon: 4,
      },
      {
        text: 'Make more noise than it does.',
        skill: 'intimidation',
        dc: 14,
        tried: 'Steel on steel, and four people shouting at a wood that has gone quiet.',
        held: 'Whatever it was decides it is somebody else\'s evening, and the noise of it going is louder than the noise of it coming.',
        lost: 'It answers. Everything that was following now knows exactly where to be.',
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
    read: { skill: 'investigation', line: 'That earth has been turned, and it was turned from underneath.' },
    xp: [16, 24],
    con: [-2, -1],
    body: ['[Placeholder Text]'],
    ways: [
      {
        text: 'Notice it while it is still only turned earth.',
        skill: 'investigation',
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
  {
    id: 'animal',
    name: 'Something living',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 4, night: 3 },
    read: { skill: 'woodcraft', line: 'Tracks. Something came through here on four legs and was not hurrying.' },
    xp: [12, 20],
    con: [-2, 0],
    body: ['[Placeholder Text]'],
    ways: [
      {
        text: 'Get near enough without it bolting.',
        skill: 'woodcraft',
        dc: 13,
        tried: 'Downwind, slowly, and stopping every time it stops.',
        held: 'It stands still long enough to be worth the standing still.',
        // a cured hide is the same material as sailcloth to anyone patching a roof with it
        spoils: { canvas: [1, 2] },
        lost: 'It bolts, and it does not bolt away from you first.',
        lostCon: 3,
      },
      {
        text: 'Take what it is standing over off it.',
        skill: 'intimidation',
        dc: 13,
        tried: 'Straight at it, upright, and nobody looking away.',
        held: 'It goes back into the trees and leaves most of what it had been eating.',
        lost: 'It does not go anywhere, and it was not eating on its own.',
        spoils: { canvas: [1, 2] },
        lostCon: 3,
      },
    ],
  },
  {
    // The one node that gives the party something back instead of taking it: they stop,
    // put a fire on and cook what they are carrying. Nothing is carried home from it —
    // they ate it — so what it is worth is the constitution the ways hand back.
    id: 'fire',
    name: 'A fire, and what you carry',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 2, night: 4 }, // mostly a thing done after dark, when it is wanted most
    read: { skill: 'woodcraft', line: 'There is dry wood under that overhang, and it is the last of it for a mile.' },
    xp: [8, 14],
    con: [1, 2], // the stopping itself, before anybody has done anything with it
    body: ['[Placeholder Text]'],
    ways: [
      {
        text: 'Build it so it will still be burning in an hour.',
        skill: 'woodcraft',
        dc: 11,
        tried: 'Standing deadwood, split small, and a wall of packs on the weather side of it.',
        held: 'It takes first time and it stays taken. Everybody gets dry.',
        lost: 'It smokes for twenty minutes and then it does not do that either.',
        con: 3,
        lostCon: 1,
      },
      {
        text: 'Make a meal of what four people are each carrying separately.',
        skill: 'cooking',
        dc: 12,
        tried: 'Everything out of every pack in one pot, in an order somebody has thought about.',
        held: 'It is the first hot thing anybody has had since the gate, and it is good.',
        lost: 'It is hot. That is the whole of what can be said for it.',
        con: 4,
        lostCon: 0,
      },
    ],
  },
  {
    id: 'find',
    name: 'Left behind',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 3, night: 2 },
    read: { skill: 'investigation', line: 'Something is stacked too neatly on that side to have got there by weather.' },
    xp: [6, 10],
    con: [0, 0],
    body: ['[Placeholder Text]'],
    ways: [
      {
        text: 'Go through it properly.',
        skill: 'investigation',
        dc: 12,
        tried: 'Everything out, laid in a line, and looked at in the order it came out.',
        held: 'Somebody stacked this to come back for it, and did not, and there is enough here to say why.',
        lost: 'It is a pile of wet wood and some nails.',
        spoils: { timber: [1, 2], nails: [1, 3] },
        lostCon: 0,
      },
      {
        text: 'Work out what sort of person leaves this.',
        skill: 'insight',
        dc: 13,
        tried: 'Not what is in it. How it was put down, and how much of a hurry that was.',
        held: 'They meant to be an hour. Whatever they are still carrying, they are carrying it light.',
        lost: 'It could be anybody. It probably was.',
        spoils: { nails: [1, 2] },
        lostCon: 0,
      },
    ],
  },
  {
    id: 'nest',
    name: 'Something emptied a nest here',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 3, night: 2 },
    read: { skill: 'investigation', line: 'There is grey down caught along that whole branch line, and none of it fell.' },
    xp: [10, 16],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
    ways: [
      {
        text: 'Read what is under it.',
        skill: 'investigation',
        dc: 13,
        tried: 'Shell, down, and one thing that is neither, all of it inside a stride of the trunk.',
        held: 'It was emptied from below, by somebody standing where you are standing, and they left work behind.',
        lost: 'Shell and feathers and a long time looking at both.',
        spoils: { heronfeather: [1, 2], greyarrow: [0, 1] },
        lostCon: 0,
      },
      {
        text: 'Work out what took it, from the tree rather than the ground.',
        skill: 'woodcraft',
        dc: 12,
        tried: 'The bark on the way up, and how far up the scoring stops.',
        held: 'Nothing climbed this. The scoring is a ladder, and a ladder was carried away again.',
        lost: 'Everything on that trunk could have been made by weather, and probably was.',
        spoils: { heronfeather: [1, 2], eggshell: [0, 2] },
        lostCon: 0,
      },
    ],
  },
  {
    id: 'oldiron',
    name: 'Iron in the ditch',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 3, night: 2 },
    read: { skill: 'smithing', line: 'There is a cart axle in that ditch, and axles do not come out here on their own.' },
    xp: [10, 16],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
    ways: [
      {
        text: 'Take the iron that is still worth taking.',
        skill: 'smithing',
        dc: 12,
        tried: 'Struck with the flat of a knife, one piece at a time, and listened to.',
        held: 'Half of it rings and half of it does not, and the half that rings comes home.',
        lost: 'All of it comes home. None of it is worth what it weighed on the way.',
        spoils: { nails: [2, 5], ironore: [0, 1] },
        lostCon: 1,
      },
      {
        text: 'Work out what a cart was doing this far out.',
        skill: 'investigation',
        dc: 13,
        tried: 'Which way the ruts run, how deep they are loaded, and where they stop being ruts.',
        held: 'It was loaded going out and empty coming back, and it never came back.',
        lost: 'The ditch has had twenty years to lose the answer and it has used all of them.',
        spoils: { nails: [1, 3] },
        lostCon: 1,
      },
    ],
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
    xp: [10, 18],
    con: [-2, 0],
    body: ['[Placeholder Text]'],
    ways: [
      {
        text: 'Judge how long she will hold and strip her for that long.',
        skill: 'sailing',
        dc: 13,
        tried: 'The set of her on the mud, and what the tide is doing to it while you look.',
        held: 'She holds while you strip her, and you are off her before she stops holding.',
        lost: 'She shifts on the tide with the party still aboard her.',
        spoils: { canvas: [1, 3], timber: [1, 2] },
        lostCon: 3,
      },
      {
        text: 'Work out what she was carrying before you carry any of it.',
        skill: 'investigation',
        dc: 13,
        tried: 'What is lashed down, what is not, and what has already been taken off her by somebody else.',
        held: 'Somebody has been aboard her before you, and they left the heavy half.',
        lost: 'Everything aboard is under everything else aboard.',
        spoils: { canvas: [1, 2], nails: [1, 3] },
        lostCon: 2,
      },
    ],
  },
];
