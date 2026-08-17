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
//   The resource table is kept full: every gathering skill has a node that is only that
//   skill, and a node shared with each of the others. Four skills is four solo nodes and
//   six pairings, which is the ten below. A point spent on any of them buys work nobody
//   else's points can reach, and a second specialist in the party is always a question
//   at some node rather than dead weight. src/run.js counts the table at boot and says
//   which solo or which pairing is missing, so a fifth gathering skill names its own gap.
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
//             Each harvest carries its own three lines as well:
//               text  — the way as it is offered, on the card the party reads on
//                       arriving. Imperative and short. A harvest with none falls back to
//                       naming its activity and skill, which is what they all read like
//                       before there was anything else to say.
//               offer — one line under it: what that work involves here in particular,
//                       and what taking it costs the other thing standing here.
//               done  — how it went, said afterwards: `well`, `middling` and `botched`.
//                       Which one is said comes off the engine's quality against
//                       workWellAt in tuning.js, and a botched activity says the third
//                       whatever the number. A node whose engine has not been imported
//                       yet is never played and always reads as `well`; write the other
//                       two anyway, for the day it lands.
//             A resource node's `body` is read on arriving at it, on the same card as the
//             ways in — it is a description of a place, so it comes before the work and
//             not after it. The tally afterwards says how the work went, not where it was.
//
// An encounter node also has:
//   ways    — two or three of them. Each is `text` (the way as it is offered), the
//             `skill` and `dc` it is rolled at, `tried` (the attempt, said before the
//             roll is read back), and `held` / `lost`. `spoils` and `con` are what
//             holding it is worth; `lostCon` is what losing it costs, written positive.
//             Give every way a different skill — a way naming a skill nobody on the run
//             has is shown and will not answer, and a node where all of them are shut is
//             a node the party walks past. Three ways is a node that asks three different
//             parties three different questions and is a third likelier to have something
//             for the one standing in front of it; the card holds three and no more.
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
        text: 'Fell one of the standing oaks.',
        offer: 'Straight stems and room to drop one, if you pick your gap.',
        done: {
          well: 'It went into the gap you picked and came down whole. Sound to the top, no shake in it.',
          middling: 'It hung up on the way over and sat there a moment before it dropped. Half the crown is broken off into the brash.',
          botched: 'It went the wrong way, into standing timber, and jammed there at an angle above your heads. You took what came free by hand and left the rest of it hanging.',
        },
        spoils: { timber: [2, 4] },
        draw: { count: [1, 3], odds: { oakbranch: 50, oaklog: 30, heartwood: 12 } },
      },
      {
        // The other thing standing here, and nothing to do with the first: what grows on
        // the dead wood at the foot of a stand nobody has cleared in twenty years.
        skill: 'herblore',
        activity: 'Foraging',
        text: 'Work the brash for mushrooms.',
        offer: 'Black trumpets down in the rot, oyster shelves on the old cut ends.',
        done: {
          well: 'The trumpets are thick under the leaf litter once you have the colour by eye. You clear the whole of it.',
          middling: 'You take what is showing. There is more of it further into the brash, and the light goes before you get there.',
          botched: 'Most of what you pull is past it, soft and full of flies. You throw the bad back and it is nearly all of it.',
        },
        draw: { count: [1, 2], odds: { blacktrumpet: 40, oystermushroom: 30 } },
      },
    ],
    xp: [8, 14],
    con: [-1, 0],
    body: [
      'A line of old stumps, cut low and gone grey at the edges. Past them the stand carries on unworked — oak, straight, thick enough through that whoever stopped here did not stop because the wood ran out.',
      'What they trimmed off is still lying in the brash where it fell. It has been down long enough to grow something.',
    ],
  },
  {
    // Woodcutting's own node. It came down last week: nothing has had time to grow on it
    // and nothing else is standing here, so the whole of it is one job and the party
    // either brought somebody who can do that job or turns round.
    id: 'deadfall',
    name: 'An oak gone over in the wind',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 4, night: 2 },
    read: { skill: 'woodcutting', line: 'Something big came down that way and it came down recently. The wood in it will still be sound.' },
    harvests: [
      {
        skill: 'woodcutting',
        activity: 'Felling',
        text: 'Cut the trunk into lengths.',
        offer: 'It is up off the ground its whole length. You will not be cutting dirt.',
        done: {
          well: 'It cuts pale and dry the whole way through and every length comes away clean. There is no rot in it anywhere.',
          middling: 'The trunk rolls twice while you are in it and the axe glances off both times. You get your lengths, shorter than you wanted them.',
          botched: 'You are a foot into it when the weight shifts and the whole trunk settles onto the blade. You get the axe back out. You take what was already off.',
        },
        spoils: { timber: [2, 4] },
        draw: { count: [2, 3], odds: { oaklog: 45, oakbranch: 40, heartwood: 10 } },
      },
    ],
    xp: [8, 14],
    con: [-1, 0],
    body: [
      'An oak, roots and all, lying across its own crown. The plate of earth it brought up with it is still wet on the underside.',
      'The bark has not lifted anywhere. Nothing has bored into it and nothing has come up out of it. It went over inside the week.',
    ],
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
        text: 'Fish the lane.',
        offer: 'Whatever is feeding is feeding in one line across that water.',
        done: {
          well: 'You put it in the lane on the third cast and the lane does the rest. They come up one after another until it goes quiet.',
          middling: 'You find the lane late. It has moved twice by then, and you get what is left of it.',
          botched: 'You work the whole width of it and never once find the line. The water is exactly as it was when you got here.',
        },
        draw: { count: [1, 3], odds: { bluegill: 50, perch: 30, brooktrout: 20 } },
      },
      {
        // The bank rather than the water: what grows where the light gets in and the
        // ground never dries out.
        skill: 'herblore',
        activity: 'Foraging',
        text: 'Take the bank instead.',
        offer: 'Black trumpets in the shade under the lip, where it never dries.',
        done: {
          well: 'They are in a run along the whole lip once you know to look at the underside of it. You come away with your hands full and your boots ruined.',
          middling: 'You clear what is on the top of the lip. Whatever is under it stays there, and you are not going in after it.',
          botched: 'The lip gives while you are standing on it. You come out of the mud with less than you went in with.',
        },
        draw: { count: [1, 2], odds: { blacktrumpet: 45, oystermushroom: 20 } },
      },
    ],
    xp: [10, 16],
    con: [-1, 0],
    body: [
      'Where the stream widens it stops being a stream and becomes something slower, brown and flat and going nowhere in a hurry. Rings come up on it and spread and are gone before you have found what made them.',
      'The bank on the near side never gets the sun and never dries. What grows on it grows in the dark, and comes away from the mud with a sound.',
    ],
  },
  {
    // Fishing's own node. Deep, slow and overhung — there is nothing on the bank worth
    // stopping for and no bottom worth turning over, so the water is the whole of it.
    id: 'pool',
    name: 'A deep pool under the bank',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 4, night: 2 },
    read: { skill: 'fishing', line: 'The water goes dark and stops moving under that bank. Whatever is in this stream is in there.' },
    harvests: [
      {
        skill: 'fishing',
        activity: 'Casting',
        // the big ones are down here and the small ones are not, which is the whole
        // difference between this and the shallows
        text: 'Fish the undercut.',
        offer: 'Nothing shows on the top of it. What is worth taking is against the bank and under it.',
        done: {
          well: 'You get it in tight against the cut and hold it there, and what comes up is the biggest thing anybody has had out of this stream.',
          middling: 'You take two off the edge of it. The dark part stays dark, and you never reach whatever is holding in there.',
          botched: 'You put the line into the roots on the first cast and spend the rest of it getting the line back. Whatever was under there is further under now.',
        },
        draw: { count: [2, 4], odds: { brooktrout: 45, perch: 40, bluegill: 15 } },
      },
    ],
    xp: [10, 16],
    con: [-1, 0],
    body: [
      'The stream turns hard against the bank and has cut in under it, and what it has cut is deep. The water goes from brown to black in the length of a stride.',
      'Nothing on the surface. Nothing rising. Everything that lives in this stream is down there and none of it is in a hurry to say so.',
    ],
  },
  {
    // Woodcutting and Mining in one place: the slope took the trees down with it and left
    // the face they were standing on open behind them.
    id: 'slip',
    name: 'Where the hillside came away',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 3, night: 2 },
    read: { skill: 'woodcraft', line: 'Half the trees on that slope are lying the wrong way, and the ground they were in is not there any more.' },
    harvests: [
      {
        skill: 'woodcutting',
        activity: 'Felling',
        text: 'Cut the trees out of the slip.',
        offer: 'Every one of them is under tension and not one is lying flat.',
        done: {
          well: 'You read which way each one wants to go before you put the axe in it, and every one goes that way. Nothing comes down the slope behind you.',
          middling: 'The first two go where you expect. The third comes round on you, and you spend the rest of the light digging the axe out of the ground.',
          botched: 'You cut one that was holding two others. All three go, and a good deal of the slope with them. You get clear with what was already cut.',
        },
        spoils: { timber: [1, 3] },
        draw: { count: [1, 2], odds: { oaklog: 40, oakbranch: 45 } },
      },
      {
        skill: 'mining',
        activity: 'Mining',
        text: 'Work the open face for stone.',
        offer: 'Iron showing in the seam, and everything above it loose.',
        done: {
          well: 'The face comes away in squared blocks where you set the wedges, and the ground above it holds the whole time you are under it.',
          middling: 'You get stone, all of it broken small. Twice you have to come out from under the face and wait for it to stop coming down.',
          botched: 'The face lets go above where you are working. You are out from under it before the worst of it lands. What you had is under it now.',
        },
        spoils: { stone: [1, 3] },
        draw: { count: [0, 2], odds: { ironore: 45, roughgem: 7 } },
      },
    ],
    xp: [10, 16],
    con: [-2, 0],
    body: [
      'The hillside has come off in one piece and gone down, and the trees went with it — lying now the wrong way up, roots in the air, crowns in the mud at the bottom.',
      'Where they were standing there is a raw face of open rock and cut earth, still shedding. Nothing on this slope has finished moving.',
    ],
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
        text: 'Take the run at the head of the bar.',
        offer: 'Everything moving up this water has to stack below the fast part before it can go through.',
        done: {
          well: 'They are holding in the seam below the run, nose into it, and they take everything you drift over them.',
          middling: 'You take a couple off the tail of it. The rest go up through the fast water and do not come back.',
          botched: 'You wade in above them for a better angle and put the whole bar down. Nothing in it moves again for an hour.',
        },
        draw: { count: [1, 3], odds: { brooktrout: 50, perch: 25 } },
      },
      {
        // The same gravel, read the other way: what a stream has been carrying down off
        // whatever it comes out of, and the ledge it has been carrying it off.
        skill: 'mining',
        activity: 'Mining',
        text: 'Break the ledge under the gravel.',
        offer: 'The gravel is only what has already come off it. What is worth taking is still in the rock.',
        done: {
          well: 'It opens along the seam and comes away in the water, and you take it out of the stream by hand as it goes.',
          middling: 'You get down through the gravel and into the ledge and it does not want to come. You take what breaks off the top of it.',
          botched: 'You are working in a foot of moving water and it carries the spoil off as fast as you free it. Most of what you break goes downstream.',
        },
        draw: { count: [1, 3], odds: { ironore: 40, stone: 35, roughgem: 6 } },
      },
    ],
    xp: [10, 16],
    con: [-1, 0],
    body: [
      'The stream runs out thin over a bar of grey gravel, ankle deep and quick, and you hear it from further off than you see it. Everything moving through this water has to come through here.',
      'Under the gravel there is ledge. It shows in two places where the water has cut across it, and the bands in it are not the colour of the stone around them.',
    ],
  },
  {
    // Herblore's own node, the way the narrows are Woodcutting's and the water is
    // Fishing's: one thing here, and either you brought somebody who knows it or you did
    // not. Every other Herblore harvest in the wood is the second half of somebody
    // else's node, which is a poor reason to spend a point.
    id: 'bracken',
    name: 'Fern and bracken under the eaves',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 4, night: 2 },
    read: { skill: 'herblore', line: 'That is not all bracken. There is a third of an apothecary standing in the middle of it.' },
    harvests: [
      {
        skill: 'herblore',
        activity: 'Foraging',
        text: 'Work the stand.',
        offer: 'An hour in the bracken on your knees, going by smell as much as by eye.',
        done: {
          well: 'You go through it in lines and miss nothing. Half of what comes out of it would not be recognised by anybody who walked past.',
          middling: 'You take the obvious. What is under the bracken proper stays under it, and you know that while you are walking away.',
          botched: 'You go through it fast and take everything that looked right. Sorting it afterwards, most of it is the wrong thing, and one of them is worse than wrong.',
        },
        draw: { count: [2, 4], odds: { blacktrumpet: 45, oystermushroom: 40 } },
      },
    ],
    xp: [8, 14],
    con: [-1, 0],
    body: [
      'Bracken to the waist under the last of the trees, where the canopy thins and the light comes in sideways for an hour a day. It has grown here uninterrupted long enough to have layers to it.',
      'There is more than bracken in it. Two or three things standing in there are worth a name, and one of them is worth carrying home.',
    ],
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
        activity: 'Felling',
        text: 'Cut the jam and pull the sound wood out.',
        offer: 'Take the logs holding it and the pool goes out with them.',
        done: {
          well: 'It comes apart in the order you cut it. By the time the wood is stacked on the bank the pool has drained out from under the fish.',
          middling: 'It lets go while you are still standing in it. You get out. Half of what you cut goes downstream ahead of you.',
          botched: 'Wrong log first. The whole face of it goes at once and takes the axe with it. The narrows are clear and you have nothing to show for them.',
        },
        spoils: { timber: [2, 4] },
        draw: { count: [1, 2], odds: { oaklog: 45, oakbranch: 35 } },
      },
      {
        // Everything in the stream has been backing up behind it since the autumn.
        skill: 'fishing',
        activity: 'Casting',
        text: 'Fish the pool while it still holds.',
        offer: 'Cast into the slack behind the jam. The wood stays where it is.',
        done: {
          well: 'They are stacked three deep in the slack water and they take anything you put in front of them. You stop when you run out of hands.',
          middling: 'You take a few off the top of the pool. The rest drop down under the jam and stay there.',
          botched: 'The line goes into the deadfall on the second cast and stays in it. Everything in that pool knows about you now.',
        },
        draw: { count: [2, 4], odds: { perch: 45, bluegill: 35, brooktrout: 25 } },
      },
    ],
    xp: [10, 16],
    con: [-1, 0],
    body: [
      "The narrows are stopped end to end with a winter's worth of deadfall, packed and settled and holding. The river goes round the outside of it and comes back grey.",
      'Behind the jam the water has backed up into a pool, slow and deep and dark. There are fish standing in it that have no business this far up the river.',
    ],
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
        activity: 'Mining',
        text: 'Open the face.',
        offer: 'Sound it first. It will come away in blocks or it will come away in rubble.',
        done: {
          well: 'It rings sound the whole width of it and comes off in blocks a man can carry. There is ore in the third one down.',
          middling: 'It rings hollow in two places and you work round them. What you get is good, and there is not much of it.',
          botched: 'You strike where it rang wrong and the whole face comes down at once. It is all rubble, and half of it is on the ground you were standing on.',
        },
        spoils: { stone: [2, 4] },
        draw: { count: [0, 2], odds: { ironore: 40, roughgem: 8 } },
      },
    ],
    xp: [8, 14],
    con: [-2, 0],
    body: [
      'An outcrop standing out of the slope with one whole side gone, taken off clean at some point and not recently. The break is grey where it is old and paler where it is not.',
      'It has come away square before. There is a line up the middle of the fresh face that says it will do it again, if anybody asks it properly.',
    ],
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
        activity: 'Mining',
        text: 'Follow the seam in.',
        offer: 'It runs level and it runs back. How far back is the question.',
        done: {
          well: 'It holds its thickness the whole way in and comes out clean of the clay round it. You stop because you have enough, not because it did.',
          middling: 'It thins a stride in and you are chasing it through clay after that. You come out with some of it and a good deal of the bank.',
          botched: 'The roof of it comes down while you are under it. Nobody is hurt. Everything you had loosened is under everything that was above it.',
        },
        draw: { count: [1, 3], odds: { ironore: 50, stone: 30, roughgem: 10 } },
      },
      {
        skill: 'herblore',
        activity: 'Foraging',
        text: 'Work the shelf the slump left.',
        offer: 'Two years of ground nothing has walked on, with the light straight onto it.',
        done: {
          well: 'Nothing has been at it since it came away. You take the whole shelf, and it is the cleanest stuff anybody has seen this side of the wood.',
          middling: 'You take what is on the front of the shelf. The rest is back under the overhang, and you are not going under that.',
          botched: 'The shelf is only the slump not finished slumping. It goes while you are on it and takes what you had picked with it.',
        },
        draw: { count: [1, 2], odds: { blacktrumpet: 35, oystermushroom: 25 } },
      },
    ],
    xp: [10, 16],
    con: [-1, 0],
    body: [
      'The bank has slumped and taken its own face off, and what is behind it is not more bank. A band of something darker runs through it, level, a hand thick, going back further than the light does.',
      'Where the slump came away it has left a shelf, and things have taken root on the shelf in the year or two since.',
    ],
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
    body: [
      'The path goes on ahead of you and the ground either side of it does not look any different, but the path is holding water and the ground is not. Somewhere under it there is nothing to stand on.',
    ],
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
    read: { skill: 'woodcraft', line: 'Stems that thin, grown in that close — something cleared the whole of that side once, and nothing has been at it since.' },
    xp: [6, 10],
    con: [-1, 0],
    body: [
      'Thin stems the thickness of a wrist, standing so close along that whole side that you cannot see past the second rank of them. The leaf is all overhead and the trunks under it are bare, and there is still no gap in it wide enough for a person. Whatever way through there is, it was not made by anything walking upright.',
    ],
    ways: [
      {
        text: 'Cut a way through it.',
        skill: 'woodcutting',
        dc: 12,
        tried: 'Steel into standing wood, low down where the stems come out of the ground.',
        held: 'It opens in three cuts and the party walks it upright.',
        lost: 'Nothing you cut falls. Every stem is held up by the ones either side of it, and the party comes out the far side having pushed the whole width.',
        spoils: { timber: [0, 1] },
        lostCon: 3,
      },
      {
        text: 'Find the run something else has already made through it.',
        skill: 'woodcraft',
        dc: 13,
        tried: 'Down at knee height, where anything living would have gone through it.',
        held: 'There is a run, and it comes out where the path picks up again.',
        lost: 'There are four runs and every one of them ends in more of the same.',
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
    read: { skill: 'woodcraft', line: 'Nothing is growing across that stretch, and everything either side of it is.' },
    xp: [6, 12],
    con: [-1, 0],
    body: [
      'A stretch of open ground thirty yards across with nothing growing on it, ringed the whole way round by everything that would not grow there. The first boot in goes to the ankle and keeps going a while after that.',
    ],
    ways: [
      {
        text: 'Find where something heavy has been across it before.',
        skill: 'investigation',
        dc: 13,
        tried: 'Not the ground. What has been pressed into the ground, and how long ago, and how deep it went.',
        held: 'Something the weight of a cart crossed here and did not sink. The party follows it over.',
        lost: 'Everything that ever crossed here crossed somewhere else, and the party finds that out standing in it.',
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
    body: [
      'Two of them coming the other way with packs on, and they have seen you in the same moment you have seen them. Neither party has anywhere to be that is worth not stopping for.',
    ],
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
    body: [
      'There are men standing off the path where the light does not reach, and they have been standing there long enough to have trodden the ground flat. Nobody is out here after dark without a lamp by accident.',
    ],
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
    body: [
      'The wood on that side has gone quiet in a way that spreads, one thing at a time, keeping pace with you. It has been keeping pace for longer than anybody wants to say out loud.',
    ],
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
    body: [
      'The ground here is turned in low mounds, a dozen of them, and the earth on top of each is darker than the earth around it. It has come up. It has not been put down.',
    ],
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
        text: 'Stand over it and be the worse thing standing there.',
        skill: 'intimidation',
        dc: 14,
        tried: 'Nobody backs off the mound. Everybody faces it, and the noise they make is not fear.',
        held: 'Whatever was coming up thinks better of the company and goes back down into it.',
        lost: 'It was never deciding. It was only slow.',
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
    body: [
      'Something big is standing in the open forty yards off with its head down, and it has not decided about you yet. Whatever it is standing over, it was not the one that killed it.',
    ],
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
    body: [
      'An overhang with dry ground under it and dry wood stacked against the back wall by nobody in particular. It is the last dry anything for a mile in the direction you are going.',
    ],
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
    body: [
      'A pile at the side of the path with a canvas over it and stones set on the corners of the canvas. It has been rained on a great many times and nobody has come back for it.',
    ],
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
    body: [
      'Grey down caught along a whole branch line forty feet up, and the wreck of a nest at the top of it. What is on the ground underneath came off that tree in one go.',
    ],
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
    read: { skill: 'investigation', line: 'There is a cart axle in that ditch, and axles do not come out here on their own.' },
    xp: [10, 16],
    con: [-1, 0],
    body: [
      'A cart axle in the ditch with the wheels still on it and the bed still over it, tipped and left where it went. It went in loaded, and nobody ever came back with a horse.',
    ],
    ways: [
      {
        text: 'Take the bed off it while the bed is still wood.',
        skill: 'woodcutting',
        dc: 12,
        tried: 'Boards off the frame, the sound ones stacked and the rest left where they fall.',
        held: 'Oak, under twenty years of ditch, and dry the whole way through the middle of it.',
        lost: 'Every board comes off in three pieces and none of the three is worth carrying.',
        spoils: { timber: [1, 3], nails: [2, 4] },
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
  // --- the gathering skills, asked for rather than worked ----------------------
  // Fishing, Mining and Herblore were resource work and nothing else, which made a point
  // in one of them worth half what a point in Investigation was: it bought nodes to work
  // and none to answer. These six are the other half. Each pairs one of the three with
  // something it is not already beside anywhere else.

  {
    id: 'deadwater',
    name: 'A stretch where nothing is living',
    zones: ['greywood'],
    nature: 'hazard',
    weight: { day: 3, night: 3 },
    read: { skill: 'fishing', line: 'There is nothing rising on that water and there is nothing on the bottom of it either.' },
    xp: [10, 16],
    con: [-1, 0],
    body: [
      'The water here looks like water and moves like water and has nothing in it at all — no rise, no weed, nothing on the bottom but stones. It goes on like that as far up as you can see.',
    ],
    ways: [
      {
        text: 'Work upstream until the water is alive again.',
        skill: 'fishing',
        dc: 13,
        tried: 'A cast every hundred yards, going up, until something takes.',
        held: 'It starts a mile up and it starts sharply. Above the line the stream is a stream again.',
        lost: 'Nothing takes anywhere, and the party drinks out of the same water they have been walking beside.',
        spoils: { perch: [1, 2] },
        lostCon: 3,
      },
      {
        text: 'Name what is in it.',
        skill: 'herblore',
        dc: 13,
        tried: 'What is growing at the edge of it, and what has stopped growing, and where the two meet.',
        held: 'Something upstream is leaching, and it has a name, and knowing the name is knowing not to fill a skin here.',
        lost: 'It could be anything. The party fills their skins somewhere else on the strength of not knowing.',
        spoils: { blacktrumpet: [1, 2] },
        lostCon: 2,
      },
    ],
  },
  {
    id: 'nets',
    name: "Somebody's nets, and nobody's boat",
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 3, night: 2 },
    read: { skill: 'fishing', line: 'There is a line of floats across that pool and none of them is drifting.' },
    xp: [10, 16],
    con: [-1, 0],
    body: [
      'A line of floats across the pool, set square to the current and anchored at both ends, with no boat on the bank and no path down to it. Whoever put it there put it there properly.',
    ],
    ways: [
      {
        text: 'Read the set, and lift what is in it.',
        skill: 'fishing',
        dc: 12,
        tried: 'How it is anchored, which way it faces, and how long it has been down.',
        held: 'Set for the run and left too long. Half of what is in it is still worth lifting.',
        lost: 'It has been down a fortnight. What is in it comes up in pieces.',
        spoils: { bluegill: [2, 3], canvas: [0, 1] },
        lostCon: 1,
      },
      {
        text: 'Work out whether whoever set it is coming back.',
        skill: 'insight',
        dc: 13,
        tried: 'Nobody sets a net this carefully and abandons it. So either they are coming, or they cannot.',
        held: 'Nobody is coming. Whatever stopped them stopped them a while ago, and the net is salvage.',
        lost: 'You take it, and you spend the rest of the walk wondering.',
        spoils: { canvas: [1, 2], nails: [0, 2] },
        lostCon: 1,
      },
    ],
  },
  {
    id: 'adit',
    name: 'A hole in the hillside somebody made',
    zones: ['greywood'],
    nature: 'hazard',
    weight: { day: 3, night: 2 },
    read: { skill: 'mining', line: 'That is not a cave. Somebody cut that, and they cut it square.' },
    xp: [12, 18],
    con: [-2, 0],
    body: [
      'A square-cut mouth in the hillside with a spoil heap outside it gone over with grass. The dark inside goes back further than the light does.',
    ],
    ways: [
      {
        text: 'Sound the roof and go in as far as it holds.',
        skill: 'mining',
        dc: 13,
        tried: 'The haft of a pick against the back of it, one pace at a time, listening for the note to go dead.',
        held: 'It rings sound for thirty feet and then it does not, and thirty feet is enough.',
        lost: 'The note goes dead a pace after somebody has already taken it.',
        spoils: { ironore: [1, 2], stone: [1, 2] },
        lostCon: 4,
      },
      {
        text: 'Work out why they stopped.',
        skill: 'investigation',
        dc: 13,
        tried: 'Tools left or tools taken, spoil stacked or spoil scattered, and how tidily the last day ended.',
        held: 'They stopped in an afternoon and took nothing with them. What they left is still worth carrying.',
        lost: 'They stopped. The hill is not saying anything else about it.',
        spoils: { nails: [1, 3], roughgem: [0, 1] },
        lostCon: 2,
      },
    ],
  },
  {
    id: 'rockfall',
    name: 'The path is under the hill',
    zones: ['greywood'],
    nature: 'hazard',
    weight: { day: 3, night: 3 },
    read: { skill: 'woodcraft', line: 'Half that slope is lying across the path and the trees above it are leaning after it.' },
    xp: [8, 14],
    con: [-1, 0],
    body: [
      'The path is under a slope that came down and stopped, and stopped is as much as anybody can say for it. The trees above the scar are leaning after it.',
    ],
    ways: [
      {
        text: 'Break it up and move it.',
        skill: 'mining',
        dc: 12,
        tried: 'The big ones first, split where they want to split, and rolled rather than lifted.',
        held: 'It comes apart along its own lines and goes over the edge in an hour.',
        lost: 'The wrong one goes first and takes the rest of the slope down onto the path behind it.',
        spoils: { stone: [2, 3] },
        lostCon: 3,
      },
      {
        text: 'Lever it with something long enough.',
        skill: 'woodcutting',
        dc: 12,
        tried: 'A trunk down, limbed, and set under the worst of it with a stone for a fulcrum.',
        held: 'One at a time and all of it, and the lever is still good enough to carry off afterwards.',
        lost: 'The lever goes before the stone does, and it goes across somebody.',
        spoils: { timber: [1, 2] },
        lostCon: 3,
      },
    ],
  },
  {
    id: 'blight',
    name: 'Something has gone through this stand',
    zones: ['greywood'],
    nature: 'hazard',
    weight: { day: 4, night: 2 },
    read: { skill: 'woodcraft', line: 'Every tree on that side is bare and it is the wrong month to be bare.' },
    xp: [10, 16],
    con: [-1, 0],
    body: [
      'Every tree on that side is bare and it is the wrong month to be bare. The edge of it is sharp — one trunk in full leaf, the next one along it not.',
    ],
    ways: [
      {
        text: 'Name it, and cut round what it has taken.',
        skill: 'herblore',
        dc: 12,
        tried: 'What is on the bark, what is under it, and which of the two came first.',
        held: 'It has a name and an edge, and everything outside the edge is still good.',
        lost: 'Whatever it is, it is on the party\'s hands now, and it takes a week to stop itching.',
        spoils: { blacktrumpet: [1, 3] },
        lostCon: 2,
      },
      {
        text: 'Read how far it has got and go round the whole of it.',
        skill: 'woodcraft',
        dc: 13,
        tried: 'The shape of it from the outside: where it started and which way the wind has been.',
        held: 'It is a wedge, and the party walks round the point of the wedge in twenty minutes.',
        lost: 'It is not a wedge. The party is an hour into it before anybody says so.',
        spoils: { oakbranch: [1, 2] },
        lostCon: 2,
      },
    ],
  },
  {
    id: 'sickness',
    name: 'One of you is not right',
    zones: ['greywood'],
    nature: 'hazard',
    weight: { day: 3, night: 3 },
    read: { skill: 'insight', line: 'Somebody has not said anything for a mile, and it is not the somebody who never does.' },
    xp: [10, 16],
    con: [-2, -1],
    body: [
      'Somebody has been walking at the back for an hour without saying anything, and it is not the one who never does. They are grey around the mouth and they are not admitting to it.',
    ],
    ways: [
      {
        text: 'Treat it.',
        skill: 'herblore',
        dc: 13,
        tried: 'What they have eaten, what they have drunk, and what is growing within fifty yards that answers it.',
        held: 'It is a thing with a remedy, and the remedy is standing in the next clearing.',
        lost: 'It is a thing with a remedy somewhere else. They walk the rest of it grey.',
        con: 3,
        lostCon: 2,
      },
      {
        text: 'Get something hot into them and keep walking.',
        skill: 'cooking',
        dc: 12,
        tried: 'Broth, thin, and enough salt in it to be worth swallowing.',
        held: 'By the second cup they are talking again, and by the third they are complaining, which is better.',
        lost: 'They keep none of it down and the party has lost an hour finding that out.',
        con: 3,
        lostCon: 1,
      },
    ],
  },

  // --- three ways in -----------------------------------------------------------
  // A node with three ways covers three pairings of skill at once and is a third likelier
  // to have something for whoever is standing in front of it. Seven of them here, and
  // between them they take up twenty-one of the pairings the wood had never asked for.

  {
    id: 'ferry',
    name: 'A man with a punt, and a price',
    zones: ['greywood'],
    nature: 'talk',
    weight: { day: 3, night: 2 },
    read: { skill: 'persuasion', line: 'There is somebody sitting on the far bank who has been watching you since the treeline.' },
    xp: [12, 18],
    con: [-1, 0],
    body: [
      'The stream is too wide here to jump and too deep to want to wade. There is a man on the far bank sitting on a punt, and he has been watching you come since the treeline.',
    ],
    ways: [
      {
        text: 'Agree a price and be carried.',
        skill: 'persuasion',
        dc: 12,
        tried: 'He names a number. Nobody takes the first number.',
        held: 'Three crossings for the price of one, and he poles it himself.',
        lost: 'One crossing for the price of three, and everybody gets wet anyway.',
        con: 1,
        lostCon: 2,
      },
      {
        text: 'Read the water and wade it where it is thin.',
        skill: 'fishing',
        dc: 12,
        tried: 'Where the surface breaks and where it does not, walked out to a knee first.',
        held: 'Gravel the whole way and no deeper than a thigh. He watches you do it.',
        lost: 'It is thin where you are looking and it is not thin where you are walking.',
        spoils: { perch: [0, 1] },
        lostCon: 3,
      },
      {
        text: 'Find the crossing the deer are using.',
        skill: 'woodcraft',
        dc: 13,
        tried: 'Upstream, on the bank, looking for where the same four feet come down twice.',
        held: 'Half a mile up and worn to a step. Anything that lives here crosses there.',
        lost: 'Half a mile up, half a mile back, and the light lower than it was.',
        lostCon: 2,
      },
    ],
  },
  {
    id: 'cairn',
    name: 'A cairn nobody has added to',
    zones: ['greywood'],
    nature: 'hazard',
    weight: { day: 3, night: 3 },
    read: { skill: 'woodcraft', line: 'There are three ways off that clearing and somebody once thought it was worth saying which.' },
    xp: [8, 14],
    con: [-1, 0],
    body: [
      'Three ways off one clearing, and a cairn standing waist high where they part. Nothing on top of it, and nothing added to it in years.',
    ],
    ways: [
      {
        text: 'Read the stone. None of it came from here.',
        skill: 'mining',
        dc: 12,
        tried: 'Grain, colour and how it has weathered, one course at a time.',
        held: 'It was carried up from a bed two valleys east, which is where the road it marks goes.',
        lost: 'It is stone. It has been stone for a long time.',
        spoils: { stone: [1, 2] },
        lostCon: 2,
      },
      {
        text: 'Work out what it was built to mark.',
        skill: 'insight',
        dc: 12,
        tried: 'Not what it says. What somebody wanted badly enough to stack a hundredweight of rock about.',
        held: 'It is not a signpost. It is a boundary, and the party is on the side of it they want to be.',
        lost: 'Somebody built it. That is as far as anybody gets.',
        con: 1,
        lostCon: 2,
      },
      {
        text: 'See which way off it is still walked.',
        skill: 'woodcraft',
        dc: 12,
        tried: 'Three mouths, and how much has grown across each of them since spring.',
        held: 'Two have closed over. The third has not, and the third is the one you want.',
        lost: 'All three look walked and all three look grown. You pick one.',
        lostCon: 2,
      },
    ],
  },
  {
    id: 'claim',
    name: 'Somebody is cutting here',
    zones: ['greywood'],
    nature: 'talk',
    weight: { day: 4, night: 1 },
    read: { skill: 'insight', line: 'That is a saw, and whoever is on the end of it stopped when they heard you.' },
    xp: [12, 20],
    con: [-1, 0],
    body: [
      'A stand half worked, with the cut wood stacked square and a saw going somewhere behind it. The saw stops the moment they hear you.',
    ],
    ways: [
      {
        text: 'Tell them to put the saw down.',
        skill: 'intimidation',
        dc: 13,
        tried: 'Nobody says whose wood it is. Everybody stands as though they know.',
        held: 'The saw goes down, and what is already cut is stacked and nobody carries it home but you.',
        lost: 'The saw does not go down, and there are more of them behind the stand than in front of it.',
        spoils: { timber: [1, 3] },
        lostCon: 3,
      },
      {
        text: 'Work out who they answer to.',
        skill: 'insight',
        dc: 13,
        tried: 'Which of them looks at which before speaking, and how long they take about it.',
        held: 'They answer to somebody who is not here, and hearing you say his name is enough.',
        lost: 'They answer to nobody, which is worse, and they say so at length.',
        spoils: { nails: [1, 2] },
        lostCon: 2,
      },
      {
        text: 'Show them the stand they are ruining.',
        skill: 'woodcutting',
        dc: 12,
        tried: 'Which trees they have taken, in what order, and what that has done to the ones left.',
        held: 'They did not know. They are not glad to be told, but they stop, and they leave the cut.',
        lost: 'They knew. They are cutting it out and moving on, and they say so without looking up.',
        spoils: { timber: [2, 3] },
        lostCon: 2,
      },
    ],
  },
  {
    id: 'panners',
    name: 'Somebody is working this water',
    zones: ['greywood'],
    nature: 'talk',
    weight: { day: 3, night: 2 },
    read: { skill: 'mining', line: 'The stream is running brown a mile below anything that should be making it run brown.' },
    xp: [12, 18],
    con: [-1, 0],
    body: [
      'Round the bend there are four of them standing in the shallows with pans, and the whole stream below them is running brown. They see you in the same moment you see them.',
    ],
    ways: [
      {
        text: 'Move them off it.',
        skill: 'intimidation',
        dc: 13,
        tried: 'Four of you on the bank above them, and nobody in a hurry to explain.',
        held: 'They go downstream. What is in the pans when they go stays where it is.',
        lost: 'They do not go, and one of them has been waiting all week for somebody to try.',
        spoils: { roughgem: [0, 1], stone: [1, 2] },
        lostCon: 3,
      },
      {
        text: 'Read the gravel and work where they have not.',
        skill: 'mining',
        dc: 12,
        tried: 'Where the water slows, where the heavy stuff drops, and how far up they have got.',
        held: 'They are working the wrong bar. The right one is two bends up and untouched.',
        lost: 'They are working the right bar. That is why they are on it.',
        spoils: { ironore: [1, 2] },
        lostCon: 2,
      },
      {
        text: 'Leave them to it and fish above the mud.',
        skill: 'fishing',
        dc: 12,
        tried: 'Upstream of the silt, where the water is still water.',
        held: 'Everything in the stream has moved up out of their mess, and it is all in one pool.',
        lost: 'Everything in the stream has moved further up than that.',
        spoils: { brooktrout: [1, 2] },
        lostCon: 1,
      },
    ],
  },
  {
    id: 'burner',
    name: 'A charcoal burner, and his stack',
    zones: ['greywood'],
    nature: 'talk',
    weight: { day: 3, night: 2 },
    read: { skill: 'persuasion', line: 'That is a working stack, and a working stack has somebody sitting up with it.' },
    xp: [12, 18],
    con: [-1, 0],
    body: [
      'A turf-covered stack smoking evenly in a clearing somebody has kept clear on purpose, and a lean-to beside it with a man sitting in the mouth of it.',
    ],
    ways: [
      {
        text: 'Get him talking.',
        skill: 'persuasion',
        dc: 12,
        tried: 'He has not spoken to anybody in nine days and is pretending he does not mind.',
        held: 'He minds. Once he starts he does not stop, and half of it is worth hearing.',
        lost: 'He answers everything and tells you nothing, which takes an hour.',
        spoils: { pitch: [1, 2] },
        lostCon: 1,
      },
      {
        text: 'Read the camp rather than the man.',
        skill: 'investigation',
        dc: 13,
        tried: 'How many bowls, how much bedding, and how far the wood has been dragged.',
        held: 'He is not out here alone and he is not out here for charcoal.',
        lost: 'A man, a stack, and nine days of firewood. Nothing that is not what it looks like.',
        spoils: { nails: [1, 3] },
        lostCon: 1,
      },
      {
        text: 'Name what is drying on his racks.',
        skill: 'herblore',
        dc: 12,
        tried: 'None of it is for the pot and only half of it is for a person.',
        held: 'Two of the three would be worth money in town and he knows the price of one.',
        lost: 'Leaves. Leaves, and a man watching you look at his leaves.',
        spoils: { blacktrumpet: [1, 2] },
        lostCon: 1,
      },
    ],
  },
  {
    id: 'camp',
    name: 'A fire that is not yours',
    zones: ['greywood'],
    nature: 'talk',
    weight: { day: 2, night: 4 },
    read: { skill: 'persuasion', line: 'There is a light through the trees and it is sitting still.' },
    xp: [10, 16],
    con: [0, 1],
    body: [
      'A light through the trees that is sitting still, and close to, four people round a fire that is not going to last the night.',
    ],
    ways: [
      {
        text: 'Ask to sit at it.',
        skill: 'persuasion',
        dc: 12,
        tried: 'Hands out, walking slowly, and asking from further off than you have to.',
        held: 'They shift up. Nobody has anything to say and everybody is glad of the company.',
        lost: 'They shift up, and then they sit watching you until you go.',
        con: 3,
        lostCon: 1,
      },
      {
        text: 'Bring wood, and be welcome.',
        skill: 'woodcutting',
        dc: 11,
        tried: 'An armful of standing deadwood, split, before anybody has been asked anything.',
        held: 'A fire that would have died at midnight burns to morning, and everybody sleeps at it.',
        lost: 'What you bring is green and it smokes them out of their own camp.',
        con: 2,
        spoils: { timber: [0, 1] },
        lostCon: 1,
      },
      {
        text: 'Put something in their pot.',
        skill: 'cooking',
        dc: 12,
        tried: 'What is left in four packs, gone over for what would improve a thin stew.',
        held: 'It is the best thing anybody at that fire has eaten in a month, theirs included.',
        lost: 'It is a thin stew with more in it.',
        con: 4,
        lostCon: 1,
      },
    ],
  },
  {
    id: 'barrels',
    name: 'Barrels in the shallows',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 3, night: 2 },
    read: { skill: 'investigation', line: 'There is something square in that water and nothing square gets into a stream by itself.' },
    xp: [10, 16],
    con: [-1, 0],
    body: [
      'Three barrels lying on their sides in the shallows, one of them staved in and empty. Nothing square gets into a stream by itself.',
    ],
    ways: [
      {
        text: 'Work out what came off, and where from.',
        skill: 'investigation',
        dc: 12,
        tried: 'How they are lying, how far apart, and which of them has been opened already.',
        held: 'A cart went in upstream and not long ago, and there is more of it up there than down here.',
        lost: 'Barrels. In a stream. For some time.',
        spoils: { nails: [1, 3], canvas: [0, 1] },
        lostCon: 1,
      },
      {
        text: 'Get them out without losing them downstream.',
        skill: 'fishing',
        dc: 12,
        tried: 'Roped, worked to the slack water, and floated rather than lifted.',
        held: 'All of them, dry side up, on the bank, and nobody in the water past a knee.',
        lost: 'Two of them go past you at walking pace and are not seen again.',
        spoils: { pitch: [1, 2], canvas: [1, 2] },
        lostCon: 2,
      },
      {
        text: 'Work out which of it is still food.',
        skill: 'cooking',
        dc: 12,
        tried: 'Seal by seal, and smelt before it is tasted.',
        held: 'Two are sound and one of the two is salt beef, which is worth the whole afternoon.',
        lost: 'It has been in a stream. All of it has been in a stream.',
        con: 2,
        lostCon: 2,
      },
    ],
  },

  // --- and the rest of the pairings ---------------------------------------------

  {
    id: 'boar',
    name: 'Something is rooting where you wanted to dig',
    zones: ['greywood'],
    nature: 'hazard',
    weight: { day: 3, night: 3 },
    read: { skill: 'herblore', line: 'The best ground on this side has been turned over by something that was not looking for what you are.' },
    xp: [10, 16],
    con: [-1, 0],
    body: [
      'The best ground on this side has been turned over end to end, and the thing that turned it is still standing in the middle of what is left of it.',
    ],
    ways: [
      {
        text: 'Take what is left round the edges of it.',
        skill: 'herblore',
        dc: 12,
        tried: 'The rim of the turned ground, where the roots were too shallow to be worth its while.',
        held: 'It missed the whole of the north edge, and the north edge is where the light gets in.',
        lost: 'It missed nothing. It has been at this for a week.',
        spoils: { blacktrumpet: [1, 2] },
        lostCon: 2,
      },
      {
        text: 'Drive it off the patch.',
        skill: 'intimidation',
        dc: 13,
        tried: 'Uphill of it, upwind of it, and all four of you at once.',
        held: 'It goes, and it goes without deciding whether it wanted to.',
        lost: 'It does not go. It comes, and it comes faster than anything that shape should.',
        spoils: { oystermushroom: [1, 3] },
        lostCon: 3,
      },
    ],
  },
  {
    id: 'hungry',
    name: 'They have not eaten and they can see that you have',
    zones: ['greywood'],
    nature: 'talk',
    weight: { day: 3, night: 3 },
    read: { skill: 'insight', line: 'There are people on that path and they have stopped walking to watch you come.' },
    xp: [10, 16],
    con: [-1, 0],
    body: [
      'There are people on the path ahead who have stopped walking to watch you come. They are carrying nothing, and they have been carrying nothing a while.',
    ],
    ways: [
      {
        text: 'Stretch the pot to cover them.',
        skill: 'cooking',
        dc: 12,
        tried: 'More water, more salt, and everything in the packs that will swell.',
        held: 'It goes round nine where it was made for four, and it is still worth eating.',
        lost: 'It goes round nine. It is not worth eating and there is none of it left.',
        con: 2,
        spoils: { nails: [0, 2] },
        lostCon: 2,
      },
      {
        text: 'Make it clear the pot is not theirs.',
        skill: 'intimidation',
        dc: 12,
        tried: 'Nothing said. The party keeps walking and keeps the fire between.',
        held: 'They stand aside. Nobody enjoys it and everybody eats.',
        lost: 'They stand aside, and then they follow, and they are still there at dusk.',
        lostCon: 2,
      },
    ],
  },
  {
    id: 'cutting',
    name: 'The path runs through a cutting and the cutting is full',
    zones: ['greywood'],
    nature: 'hazard',
    weight: { day: 3, night: 2 },
    read: { skill: 'mining', line: 'Somebody cut that bank square once, and the bank has been putting itself back ever since.' },
    xp: [8, 14],
    con: [-1, 0],
    body: [
      'The path drops into a cutting somebody squared off a long time ago, and the bank has been putting itself back into it ever since. There is a gang in there now shifting it, and they have been at it since dawn.',
    ],
    ways: [
      {
        text: 'Get in and shift it, which is quicker than waiting.',
        skill: 'mining',
        dc: 12,
        tried: 'From the top down, and never standing under what is being moved.',
        held: 'It comes out in an hour and the gang on the far side are glad enough to say so.',
        lost: 'It comes out on top of the party, which is one way of moving it.',
        spoils: { stone: [1, 3] },
        lostCon: 3,
      },
      {
        text: 'Get the gang to let you over their spoil.',
        skill: 'persuasion',
        dc: 12,
        tried: 'They have been at it since dawn and they are not being paid by the hour.',
        held: 'Over the top, one at a time, and somebody gives you a hand up at the far end.',
        lost: 'The long way round, in the dark, with the sound of shovels behind you the whole way.',
        lostCon: 2,
      },
    ],
  },
  {
    id: 'offering',
    name: 'Somebody has left something at the foot of that tree',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 3, night: 3 },
    read: { skill: 'investigation', line: 'There is a bundle at the root of that oak and it was put there, not dropped.' },
    xp: [10, 16],
    con: [-1, 0],
    body: [
      'A bundle at the root of an oak, tied in cloth and set upright against the trunk. Nobody drops a thing and leaves it standing.',
    ],
    ways: [
      {
        text: 'Name what is in the bundle.',
        skill: 'herblore',
        dc: 12,
        tried: 'Opened on a flat stone, one thing at a time, and nothing touched twice.',
        held: 'Every one of them is a thing somebody grows on purpose, and none of them grows here.',
        lost: 'Leaves, shell and string, and none of it says anything to anybody.',
        spoils: { blacktrumpet: [1, 2], eggshell: [0, 1] },
        lostCon: 1,
      },
      {
        text: 'Work out what was being asked for, and of what.',
        skill: 'insight',
        dc: 13,
        tried: 'Not what is in it. How carefully it was tied, and how far somebody carried it to leave it here.',
        held: 'They were frightened when they tied it and they were frightened of something specific.',
        lost: 'Somebody wanted something. Everybody does.',
        spoils: { nails: [1, 2] },
        lostCon: 2,
      },
    ],
  },
  {
    id: 'spoiled',
    name: 'Half of what you are carrying has turned',
    zones: ['greywood'],
    nature: 'hazard',
    weight: { day: 3, night: 3 },
    read: { skill: 'cooking', line: 'Something in one of the packs has been smelling wrong since noon and nobody has said so.' },
    xp: [8, 14],
    con: [-2, -1],
    body: [
      "Something in one of the packs has been smelling wrong since noon, and everybody has quietly decided it is somebody else's pack. It will not get better between here and the gate.",
    ],
    ways: [
      {
        text: 'Salvage what will salvage.',
        skill: 'cooking',
        dc: 12,
        tried: 'Everything out, sorted into three piles, and the middle pile cooked hard.',
        held: 'Two days of food out of what was going to be none, and nobody the worse for it.',
        lost: 'One pile, and it goes in the ditch, and the party walks the rest on what is left.',
        con: 3,
        lostCon: 2,
      },
      {
        text: 'Find out who has quietly not been eating.',
        skill: 'insight',
        dc: 12,
        tried: 'Not the packs. Who has been last to the fire and first away from it.',
        held: 'Somebody has been going short for two days to make it stretch, and saying so fixes it.',
        lost: 'Everybody says they are fine. Everybody is lying and nobody is caught at it.',
        con: 2,
        lostCon: 2,
      },
    ],
  },
  {
    id: 'flood',
    name: 'The path is under water for a hundred yards',
    zones: ['greywood'],
    nature: 'hazard',
    weight: { day: 3, night: 3 },
    read: { skill: 'fishing', line: 'The stream is over its bank and it is over the path with it.' },
    xp: [8, 14],
    con: [-1, 0],
    body: [
      'The stream has come over its bank and taken the path with it for a hundred yards. There is no telling from this end where under all that the path actually runs.',
    ],
    ways: [
      {
        text: 'Read it for where it is shallow enough to wade.',
        skill: 'fishing',
        dc: 12,
        tried: 'Where it runs and where it lies, and what colour it is over each.',
        held: 'It is a hand deep over the path and shoulder deep six feet to the left of it.',
        lost: 'It is not a hand deep anywhere, and somebody finds the old ditch with a leg.',
        lostCon: 3,
      },
      {
        text: 'Fell something across it and walk over.',
        skill: 'woodcutting',
        dc: 12,
        tried: 'An alder on the near bank, dropped along the path rather than across it.',
        held: 'It goes where it was told and it is dry the whole length.',
        lost: 'It goes in the water, and now the water has a tree in it.',
        spoils: { timber: [0, 1] },
        lostCon: 2,
      },
    ],
  },
  {
    id: 'sap',
    name: 'A tree that is bleeding',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 3, night: 2 },
    read: { skill: 'woodcutting', line: 'There is an oak on that side running down its own trunk, and it has been running a while.' },
    xp: [10, 16],
    con: [-1, 0],
    body: [
      'An oak on that side running down its own trunk, a stripe of it from a wound at head height all the way to the roots. It has been running long enough for the ground under it to be sticky.',
    ],
    ways: [
      {
        text: 'Tap it properly.',
        skill: 'herblore',
        dc: 12,
        tried: 'A cut above the wound rather than into it, and something under it to catch what comes.',
        held: 'It runs clean for an hour and the tree closes over behind it.',
        lost: 'It runs for ten minutes and then it runs somewhere you are not holding anything.',
        spoils: { pitch: [2, 3] },
        lostCon: 1,
      },
      {
        text: 'Take the wound out and leave the tree standing.',
        skill: 'woodcutting',
        dc: 12,
        tried: 'The bad wood cut back to sound wood, which is further in than it looks.',
        held: 'The rot comes out in one piece and what is under it is dark and dry and sound.',
        lost: 'The rot goes further than the axe does, and the tree will be down by spring.',
        spoils: { timber: [1, 2], heartwood: [0, 1] },
        lostCon: 1,
      },
    ],
  },
  {
    id: 'spring',
    name: 'Water coming out of the rock',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 3, night: 3 },
    read: { skill: 'mining', line: 'There is water coming out of that face and it is coming out clear.' },
    xp: [8, 14],
    con: [1, 2],
    body: [
      'Water coming straight out of the face of the rock, clear, cold enough to ache, running off into moss that has been there a long time.',
    ],
    ways: [
      {
        text: 'Tell whether it is worth drinking.',
        skill: 'herblore',
        dc: 11,
        tried: 'What is growing in it, what is growing beside it, and what has stopped.',
        held: 'Everything that ought to be living in it is. The skins go in.',
        lost: 'Nobody can say, so nobody drinks, and the party carries the same water it carried in.',
        con: 3,
        lostCon: 2,
      },
      {
        text: 'Tell what it has come through, which says the same.',
        skill: 'mining',
        dc: 12,
        tried: 'The face above it and the crust it has left on the way down.',
        held: 'Clean rock the whole way and nothing above it but more rock. It is good water.',
        lost: 'Something up there is bleeding into it and there is no telling what.',
        con: 3,
        spoils: { roughgem: [0, 1] },
        lostCon: 2,
      },
    ],
  },
  {
    id: 'bakehouse',
    name: 'A bread oven standing in nothing',
    zones: ['greywood'],
    nature: 'gather',
    weight: { day: 3, night: 2 },
    read: { skill: 'investigation', line: 'That is the last wall of a holding, and the only part of it anybody built properly.' },
    xp: [10, 16],
    con: [-1, 0],
    body: [
      'A bread oven and the wall it is set into, and nothing else — no floor, no roof, no other wall. It is the only part of whatever this was that anybody built to last.',
    ],
    ways: [
      {
        text: 'Light it, and use it.',
        skill: 'cooking',
        dc: 12,
        tried: 'Swept, fired for an hour, raked out, and the door stopped with a flat stone.',
        held: 'It draws like the day it was built. Everything the party is carrying goes in it.',
        lost: 'It draws backwards. The clearing is full of smoke and nothing in it is cooked.',
        con: 3,
        lostCon: 1,
      },
      {
        text: 'Take the stone; it is cut and squared already.',
        skill: 'mining',
        dc: 12,
        tried: 'The arch first, because the arch is what the rest of it is holding up.',
        held: 'It comes down course by course and every block of it is worth carrying.',
        lost: 'It comes down all at once and most of it is rubble on the way.',
        spoils: { stone: [2, 4] },
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
    body: [
      'A hull on its side on the mud with the tide out and the water going round it. She is far enough up the flat that somebody put her there, or the sea did it hard.',
    ],
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
