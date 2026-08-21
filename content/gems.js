// The nine stones, what each one is worth set in something, and what it looks like coming
// out of the ground. A gem is cut on the wheel in the corner of the smithy and set into a
// socket of something worn; see src/gear.js.
//
// A stone does two different things and which one it does is decided by where it is set.
// In a ring, a bracelet or an amulet it is worn against the skin and sharpens what its
// wearer can do — that is `skills`. Set into a weapon or a piece of armour it is in the
// metal and does what the metal does — that is `combat`. The same stone is a different
// stone depending on which. Nothing chooses both at once, so a party with one good stone
// and two places to put it has a real question in front of them.
//
//   id     — how content/recipes.js and src/gear.js refer to it.
//   name   — the cut stone's name. What it is called worn is the grade and this: a Fine
//            Sapphire, a Flawless Ruby.
//   tier   — 1, 2 or 3. What a tier means is the length of each list: a tier one stone
//            moves one number either way, a tier three stone moves three. It also says
//            how hard the stone is to cut, where it is dug, and what metal will hold
//            it — bronze takes tier one; see content/gear.js.
//   rough  — the material id it is cut from, out of content/materials.js. That is what
//            drops; this list is what it becomes.
//   combat — what it moves in a weapon, a shield or a piece of armour, `tier` of them,
//            out of:
//              hp, hit, guard, harm   — the four a fighter fights on
//              con                    — the constitution a run sets out with. Not a blow
//                                       struck, but it is the body and the body is what
//                                       armour is for.
//   skills — and what it moves in jewellery, `tier` of them, each a skill id from
//            content/skills.js. A stone can hand somebody a skill they have no points in
//            at all, and that counts as having it: a Sapphire is a way onto work you
//            could not otherwise take.
//
//            How far any of them moves is the grade the wheel gave it — Regular, Fine or
//            Flawless, worth +1, +2 and +3. See `grades` in tuning.js.
//   body   — the cut stone, in the world's voice. Yours to write.
//   raw    — and the rough stone, for the square it takes in the pack.
// Tier one comes off Greywood mining. Tier two and tier three are dug somewhere that is
// not written yet, so those six stones are cuttable and not yet findable — that is the
// hole, and it closes when the areas land rather than by anything here changing.
// Add a stone by adding an entry. Nothing reads this list by position.

export const GEMS = [
  // --- tier one: the Greywood ------------------------------------------------
  {
    id: 'garnet',
    name: 'Garnet',
    tier: 1,
    rough: 'roughgarnet',
    combat: ['con'],
    skills: ['fording'],
    body: [
      'Dark red gone almost black at the centre, and it holds the light rather than passing it on.',
      'Worn against the skin it is warm before it has any business being warm. Nobody has explained that and everybody who carries one has noticed it.',
    ],
    raw: [
      'A gravel-coloured lump with one wet-looking red seam through it, easy to walk past.',
      'The Greywood is full of them and always was. Nobody was digging.',
    ],
  },
  {
    id: 'agate',
    name: 'Agate',
    tier: 1,
    rough: 'roughagate',
    combat: ['guard'],
    skills: ['woodcraft'],
    body: [
      'Banded grey and white in rings, like something that grew a layer at a time and was in no hurry about it.',
      'Carters south of here sew one into the collar. They will tell you it is for luck. It is not for luck.',
    ],
    raw: [
      'A rounded nodule, dull as a river stone, that rings wrong when you knock it.',
      'The bands are all on the inside. There is no way to know what is in one until it is open.',
    ],
  },
  {
    id: 'amethyst',
    name: 'Amethyst',
    tier: 1,
    rough: 'roughamethyst',
    combat: ['hit'],
    skills: ['insight'],
    body: [
      'Violet at the tip and clear at the root, and it goes colder the longer it is held.',
      'It does not make anybody cleverer. It makes them slower to be sure, which in this town is the same thing.',
    ],
    raw: [
      'A crust of small purple points still on the grey rock they grew out of.',
      'One of them is big enough to cut. The rest are why you can see it at all.',
    ],
  },

  // --- tier two: somewhere that is not written yet ----------------------------
  {
    id: 'topaz',
    name: 'Topaz',
    tier: 2,
    rough: 'roughtopaz',
    combat: ['hit', 'harm'],
    skills: ['fishing', 'smithing'],
    body: [
      'Straw-gold, cut long, and it throws a hard clean line of light across whatever it is set down on.',
      'A stone for people whose work is decided in the half-second before it lands.',
    ],
    raw: [
      'A long prism with the ends broken square off, gold under the dirt on it.',
      'It breaks flat across the grain if it is dropped, which is most of why so few are ever cut.',
    ],
  },
  {
    id: 'sapphire',
    name: 'Sapphire',
    tier: 2,
    rough: 'roughsapphire',
    combat: ['guard', 'con'],
    skills: ['investigation', 'insight'],
    body: [
      'Blue going to grey at the edges, and there is a six-armed star in it if it is turned to the light properly.',
      'Everyone who has worn one says the same unhelpful thing: you notice the thing you were already looking at.',
    ],
    raw: [
      'A barrel of dull blue-grey, heavier than the stone around it and harder than anything you have to cut it with.',
      'What is in the middle of it is not visible from anywhere on the outside.',
    ],
  },
  {
    id: 'onyx',
    name: 'Onyx',
    tier: 2,
    rough: 'roughonyx',
    combat: ['hp', 'harm'],
    skills: ['intimidation', 'persuasion'],
    body: [
      'Black all the way down with one white band across it, polished until it shows the room back.',
      'It is what gets worn to a hanging. People know what it means and step back from it, which is the point.',
    ],
    raw: [
      'A flat black slab, dull as coal and twice as heavy, with one pale line across the break.',
      'It takes a polish nothing else here takes. That is the whole of its reputation.',
    ],
  },

  // --- tier three: somewhere that is not written yet ---------------------------
  {
    id: 'diamond',
    name: 'Diamond',
    tier: 3,
    rough: 'roughdiamond',
    combat: ['guard', 'hp', 'con'],
    skills: ['smithing', 'gemcutting', 'mountaineering'],
    body: [
      'Colourless, and every face of it doing something to the light on the way back out.',
      'There is nothing in Dreadhollow that will scratch it, which is a thing you find out about a stone by trying.',
    ],
    raw: [
      'A greasy-looking octahedron the size of a thumbnail, and it looks like nothing at all.',
      'The one thing on the road that is worth more than everything else carried out with it, and the easiest to lose.',
    ],
  },
  {
    id: 'emerald',
    name: 'Emerald',
    tier: 3,
    rough: 'roughemerald',
    combat: ['con', 'hp', 'guard'],
    skills: ['herblore', 'woodcraft', 'fording'],
    body: [
      'Deep green with a garden of flaws inside it, and the flaws are how you know it is real.',
      'Held up in the Greywood it is the exact colour of the light under the canopy. That is not a coincidence and nobody knows what it is instead.',
    ],
    raw: [
      'A green six-sided column still locked into the black rock, cracked across in two places.',
      'A flawless one has never been found anywhere. A cutter who is waiting for one is waiting for nothing.',
    ],
  },
  {
    id: 'ruby',
    name: 'Ruby',
    tier: 3,
    rough: 'roughruby',
    combat: ['hit', 'harm', 'hp'],
    skills: ['woodcutting', 'mining', 'intimidation'],
    body: [
      'Red the whole way through with a fire in the middle of it that moves when the stone does not.',
      'Worn on the hand that holds the blade, always. There is no version of the story where it is worn on the other one.',
    ],
    raw: [
      'A blunt red barrel in grey rock, the colour only showing where the light gets under an edge.',
      'The same stone as a sapphire underneath, which nobody believes the first time they are told.',
    ],
  },
];
