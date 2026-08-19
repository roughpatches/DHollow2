// What is worn rather than carried. A bar off the smithy's fire becomes one of these, and
// from then on it is not a material: it does not stack, it is not spent, and it costs the
// pack nothing. Gear is chosen at the gate on the packing screen next to the stones, and
// the reason it takes no square is that it is on the body — a man in mail is not carrying
// mail.
//
//   id    — how content/recipes.js names it in `forges`, and how src/icons.js hangs a
//           picture on it.
//   name  — shown on the shelf, in the slots, and wherever a bench says what it made.
//   slot  — weapon, offhand, body or jewellery. One thing to a slot, and the four are read
//           together.
//   stat  — the one number it moves: hit, harm, guard, hp or con. Bronze carries one buff
//           and no more, which is what makes a slot a question rather than a sum. Left off
//           for jewellery, which does nothing on its own: a ring is somewhere to put a
//           stone and is not otherwise worth wearing.
//   sockets — how many cut stones it will hold, for the pieces that hold them whatever
//           they came out like. Left off, a piece holds a stone only if it came off the
//           anvil at the top grade — see `gear.socketsAtMasterwork` in tuning.js. That is
//           the whole difference between jewellery and everything else: a ring is made to
//           carry a stone at any standard, and a sword has to be a good sword first.
//   holds — the highest tier of stone it will take. Bronze is tier one and takes tier one,
//           which is what the Greywood has in it; iron gear will say two. See
//           content/gems.js.
//   body  — what it is, in the world's voice. Yours to write.
//
// How far that one number moves is not written here: it is how well the forging went at
// the anvil. See `gear` in tuning.js for the grades and what each is worth. A piece that
// was finished badly is still a piece, and a masterwork is the same object made by
// somebody who was paying attention. A piece cracked under the hammer is no piece at all
// and the bars are gone with it — the one hard fail at a bench, and the only reason the
// soundness bar is worth watching. See src/minigames/ForgeEngine.js.
//
// Everything below is tier one, because tier one is all the Greywood has in it. Iron gear
// is the same eight entries with a different bar in front of them, the day that ground is
// walked; see content/materials.js.
// Add a piece by adding an entry. Nothing reads this list by position.

export const GEAR = [
  {
    id: 'bronzedagger',
    name: 'Bronze Dagger',
    slot: 'weapon',
    stat: 'hit',
    holds: 1,
    body: [
      'Nine inches of it, diamond in section, with a blunt sheen on the flats and a line of bright along both edges.',
      'It will not go through mail and it was never going to. It goes in the gap under the arm, which is where anybody who has done this puts it anyway.',
    ],
  },
  {
    id: 'bronzesword',
    name: 'Bronze Sword',
    slot: 'weapon',
    stat: 'harm',
    holds: 1,
    body: [
      'A leaf blade a yard long, wide at the shoulder and coming to a point that is more of an argument than a needle.',
      'It is a cutting weapon and it wants room. In a doorway you would be better off with the dagger, and you would not be the first to learn that in a doorway.',
    ],
  },
  {
    id: 'bronzeshield',
    name: 'Bronze Shield',
    slot: 'offhand',
    stat: 'guard',
    holds: 1,
    body: [
      'A round of oak faced in beaten bronze, with an iron boss at the centre of it and a single grip behind that.',
      'Grast said a free hand is worth more than a full one. Grast has never stood in front of anything that was coming on anyway.',
    ],
  },
  {
    id: 'bronzechainmail',
    name: 'Bronze Chainmail',
    slot: 'body',
    stat: 'hp',
    holds: 1,
    body: [
      'A shirt of it to the hip, split front and back for walking, heavy on the shoulders in a way that is forgotten by the second mile and remembered by the tenth.',
      'It does not stop a blow. It spreads one over a hand\'s width of you, and a blow spread that far is a bruise instead of an opening.',
    ],
  },
  {
    id: 'bronzeplatemail',
    name: 'Bronze Platemail',
    slot: 'body',
    stat: 'guard',
    holds: 1,
    body: [
      'Breast and back, shoulders, and tassets to the knee, all of it the colour of a church roof and none of it hiding that.',
      'Where the mail spreads a blow, this turns it off and sends it somewhere else entirely. Whoever is wearing it is also visible from the far side of the field, and that is half of what it is for.',
    ],
  },

  // --- the jewellery -----------------------------------------------------------
  // One slot and three things that fit it, and none of them does anything by itself.
  // What they are is settings: a stone in a ring works the same as a stone in a sword,
  // and the ring is what a party who has not forged a masterwork anything can still put
  // one in. That is why a poor ring is as good as a good one — a socket is a socket, and
  // the only thing the anvil decides about jewellery is how it looks on the shelf.
  {
    id: 'bronzering',
    name: 'Bronze Ring',
    slot: 'jewellery',
    sockets: 1,
    holds: 1,
    body: [
      'A plain band with a shallow bezel raised on it, and a stone sitting in the bezel with four claws bent over its girdle.',
      'Nobody in Dreadhollow has worn one in twenty years. That is a thing about the twenty years and not about the ring.',
    ],
  },
  {
    id: 'bronzebracelet',
    name: 'Bronze Bracelet',
    slot: 'jewellery',
    sockets: 2,
    holds: 1,
    body: [
      'A hinged cuff wide enough for two settings side by side, closed with a pin on a short chain so it cannot be dropped in the dark.',
      'Two stones is two things at once, which is the whole argument for wearing a pound of bronze on the arm you swing with.',
    ],
  },
  {
    id: 'bronzeamulet',
    name: 'Bronze Amulet',
    slot: 'jewellery',
    sockets: 3,
    holds: 1,
    body: [
      'A flat disc on a plaited cord, three settings raised round its face and the rest of it left bare and unmarked.',
      'Whatever the disc was meant to have on it, nobody put it there. Three stones is what it is for and three stones is what it says.',
    ],
  },
];
