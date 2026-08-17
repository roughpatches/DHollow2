// Every place in the game: a painting with a line drawn across it to walk along, and
// everything standing on it — a door, a building, somebody waiting — placed by how far
// along it stands and nothing else. See `street` below and src/street.js.
//
// `indoors: true` on a map says it is a room rather than the open air: anybody with a
// second look painted for indoors is drawn from that one on it. See content/looks.js.
//
export const MAPS = {
  // Where the player wakes up the morning after. Aldis carried them here.
  // A room walked along rather than around, like the Sea Hag: the same panel, the same
  // lines and the same size a person is drawn at, so a painting of this room exported the
  // way the Sea Hag's was drops into `art` and needs nothing else. Until there is one it
  // is the two flat bands — the wall down to the sill, boards below it — which is enough
  // to walk in and to stand somebody in.
  hut: {
    name: 'Aldis Rooke\'s house',
    indoors: true, // and so everyone in it is drawn from their indoor art; see content/looks.js
    street: {
      size: [688, 384],
      ground: 362, // the floor, a stride in front of the wall
      sill: 300, // and where the wall meets the boards, which is behind whoever is stood
      // on it: a painting of this room will say where both lines really are
      body: 183, // a room is painted from across it: see the Sea Hag below
      repeats: 1,
    },
    spawn: [8],
    doors: [{ x: 4, to: 'searow', spawn: [17], label: 'Out to the street' }],
  },

  // Where the game opens: the point, north up the coast from the town. The tide put the
  // player here and the storm put everything else; the track south runs off the near end
  // of the strand and comes out on the quay.
  // The last of the outdoor panels with no painting behind it, so it is the only place the
  // drawn weather still shows: dusk over a steely sea down to the tideline, and the strand
  // under it. A painting of the point drops into `art` and covers the lot.
  shore: {
    name: 'The point',
    street: {
      size: [688, 384],
      horizon: 205, // where the sea meets the sky, and so where the weather is drawn to
      ground: 352, // the walking line, up the strand from the water
      sill: 300, // and the tideline, where the sea gives out and the sand starts
      repeats: 1,
    },
    spawn: [10],
    doors: [{ x: 4, to: 'quay', spawn: [37], label: 'The track south' }],
  },

  // Dreadhollow itself, seen from the side: five painted panels laid west to east, walked
  // along rather than around. The painting is the town — the terraces, the fields, the
  // burying ground and the ruined quay are in it, not standing on it — and the cobbles
  // across the bottom of each are what is walked. They are the DH export, laid the way the
  // designer numbered them: DH5 is the far west end and DH1 the far east, and each is 688
  // by 384 with its own sky painted into it, so none of them has a horizon and nothing is
  // drawn behind them.
  //   art     — the painted town, drawn at 1:1 and laid end to end `repeats` times, every
  //             other copy flipped so the row of houses does not visibly restart.
  //   size    — how much of that painting the town is, in pixels: its width, and its height
  //             down to where its own ground runs out. The street is that many tiles wide
  //             times the repeat count; nothing else says how long the town is.
  //   ground  — how far down the painting the walking line sits. Measured off the image: it
  //             is what stands somebody on the cobbles rather than up against the doors.
  //   sill    — and how far down a building stands, which is not the same line: the town is
  //             built along the back of the road and walked along the cobbles in front of
  //             it. A building dropped in stands on this, so it sits in the row rather than
  //             out in the road. Left out, it is the walking line.
  //   horizon — how far down the panel the sea meets the sky, behind everything painted.
  //             A panel that has one is outdoors and gets weather drawn behind it; one
  //             without is indoors, or painted with a sky of its own, and gets a flat wall
  //             instead. See src/street.js.
  //   body    — how tall a person standing in this panel is drawn, feet to head. A town
  //             painted down the length of a road and a room painted from across it are
  //             not at the same scale, and a person is whatever size that panel says.
  //             Left out, it is streetBodyPx from tuning.js, which is the town's. These
  //             five are painted at the town's own scale — a door in them is a little
  //             over a person tall — so none of them says otherwise.
  //   edges   — what lies off each end: { right: 'quay', left: 'harbourroad' }. A street is
  //             a panel, not a stretch of something longer — walk into the end of one and
  //             the next is what is on the screen, standing you at its far end. Painted
  //             towns are painted a panel at a time and are not the same size as each
  //             other, so this is how one is put beside another rather than joined to it.
  // A door on a street has an x and nothing else, and is opened with [E] rather than
  // walked onto: on a street you would cross every doorway in town going to the tavern.
  // A door into a building (see content/buildings.js) is not listed here — the building
  // is its own door, and its repair state is what decides whether it opens.

  // DH5, the far west end: the road comes out of the Greywood between the trunks, a
  // scarecrow stands in what is left of a field, and the burying ground runs the length of
  // the panel behind a derelict farmhouse. The chapel stands among the graves at the east
  // end of it; see STRUCTURES in content/looks.js.
  woodend: {
    name: 'The wood end',
    street: {
      art: 'art/DH/DH5.png',
      size: [688, 384],
      ground: 352, // the middle of the cobbles
      sill: 325, // the kerb, where the ground the town stands on begins
      repeats: 1,
      edges: { right: 'fieldroad' },
    },
    spawn: [4],
    doors: [],
  },

  // DH4: derelict houses either side and a dirt gap between them where a track climbs out
  // of the town to the stubble fields. The last shopfront in Dreadhollow is at the east
  // end of it, with its sign worn past reading.
  fieldroad: {
    name: 'The field road',
    street: {
      art: 'art/DH/DH4.png',
      size: [688, 384],
      ground: 352,
      sill: 327,
      repeats: 1,
      edges: { left: 'woodend', right: 'harbourroad' },
    },
    spawn: [4],
    doors: [],
  },

  // DH3, the middle of the town and the one street anybody still walks: the tavern with
  // its sign, a house with its windows out, a well, and the nets nobody has mended. The
  // Sea Hag's door is the tavern's; see content/buildings.js.
  harbourroad: {
    name: 'The harbour road',
    street: {
      art: 'art/DH/DH3.png',
      size: [688, 384],
      ground: 354,
      sill: 328,
      repeats: 1,
      edges: { left: 'fieldroad', right: 'searow' },
    },
    spawn: [16],
    doors: [],
  },

  // DH2: stone cottages with the sea behind them, a fenced patch of ground gone to seed,
  // and the weather coming in off the water. Aldis Rooke's house is the big one at the
  // west end — the harbour is below it, which is what the morning after looks out on.
  searow: {
    name: 'The sea row',
    street: {
      art: 'art/DH/DH2.png',
      size: [688, 384],
      ground: 340, // the cobbles run out into rough grass in front; this keeps you on stone
      sill: 318,
      repeats: 1,
      edges: { left: 'harbourroad', right: 'quay' },
    },
    spawn: [17],
    doors: [
      { x: 17, to: 'hut', spawn: [8], label: 'Aldis Rooke\'s house' },
    ],
  },

  // DH1, the far east end: the imperial paving, a mooring bollard, and the jetty going out
  // over the water with the harbour beyond it. The road stops being a road here. The track
  // north up the coast leaves from the end of the quay.
  quay: {
    name: 'The quay',
    street: {
      art: 'art/DH/DH1.png',
      size: [688, 384],
      ground: 345, // the paving is drawn in perspective; this is the line across it
      sill: 300, // and the far side of it, where the quay wall stands
      repeats: 1,
      edges: { left: 'searow' },
    },
    spawn: [4],
    doors: [
      { x: 39, to: 'shore', spawn: [10], label: 'The track north' },
    ],
  },

  // Inside the Sea Hag: the bar down the left half under its shelf of bottles and pewter,
  // the tables and the wall of framed charts down the right. Painted the size of the town
  // panel rather than the two smaller ones, so it is a long room walked along rather than
  // a booth. No horizon — indoors, and the painting covers the bands anyway.
  // The lines are measured off it: the stool legs and the kick of the bar front both end
  // on the boards at 352, and the walking line is the aisle in front of them, short of the
  // tables the frame cuts through at the corners. That is what stands somebody at the bar
  // rather than inside it.
  // It is painted from across the room rather than down a road, so a person in it is five
  // times the size they are out in the town: the stools stand 67 pixels to the seat and
  // the bar 105 to its top, which is a hundred pixels to the metre and a man at 183.
  tavern: {
    name: 'The Sea Hag',
    indoors: true,
    street: {
      art: 'art/town/seahag-inside.png',
      size: [688, 384], // the whole painting; unlike the town panel its floor runs to the edge
      ground: 362, // the aisle, a stride in front of the stools
      sill: 352, // where the stool legs and the bar front meet the boards
      body: 183, // and a man standing on them, waist to the bar top
      repeats: 1, // one room; a room laid twice is two bars and one landlord
    },
    spawn: [33],
    doors: [
      // Nothing in the painting is a door, so the way out is the open end: the bar runs to
      // the left edge, and the right is floor and tables with the wall carrying on past the
      // frame. You come in at that end and walk the length of the tables to reach him.
      // Not on the last tile — the name written over your head wants room to be read.
      { x: 36, to: 'harbourroad', spawn: [16], label: 'Out to the street' },
    ],
  },

  // Inside the chapel. The door is shut until the roof is back on, so this is what the
  // last stage of the repair opens. Walked along like the rest of the rooms; the swept
  // flags, the pews that survived and the altar are the painting's when there is one.
  chapel: {
    name: 'The chapel',
    indoors: true,
    street: {
      size: [688, 384],
      ground: 362,
      sill: 300,
      body: 183,
      repeats: 1,
    },
    spawn: [8],
    doors: [{ x: 4, to: 'woodend', spawn: [37], label: 'Out to the burying ground' }],
  },
};
