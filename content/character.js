// The player's own pages: who they are, what they carry, who stands with them.
// Every entry in this file uses one shape, and so does every entry in codex.js:
//   label — the name in the left-hand list
//   note  — the short value shown right of it (slot, count, standing, status)
//   body  — the paragraphs shown in the detail pane. Add as many as you like.
// Add, delete, or rewrite entries freely. The menu reads whatever is here.

export const CHARACTER = [
  {
    // The player came in off the sea, not down the south road: see content/scenes.js.
    // Aldis Rooke is the hunter who found them, and is a recruit, not the player.
    label: 'Name',
    note: '{playerName}', // typed in the hut; see content/scenes.js
    body: ['[Placeholder Text]'],
  },
  {
    label: 'Vitality',
    note: '11',
    body: [
      'How much the body will absorb before it stops arguing.',
      'Eleven is unremarkable. A carter\'s number. It gets you through a bad night on a cold floor and not much past that.',
    ],
  },
  {
    label: 'Nerve',
    note: '9',
    body: [
      'What is left of you once the thing you were afraid of is actually in the room.',
      'Nine holds through the Quiet Hour. Nine has not been tested after dark on the north road, and Warden Marrow would rather it stayed that way.',
    ],
  },
  {
    label: 'Hands',
    note: '13',
    body: [
      'Grip, aim, and the small precision that separates a hinge from scrap.',
      'Krael watched you set a nail once and said nothing, which from him is a written commendation.',
    ],
  },
  {
    label: 'Wits',
    note: '12',
    body: [
      'How fast you put together the pieces somebody else is carefully not handing you.',
      'You noticed that Ysolde and Tally have never once been in the taproom at the same time. You have not decided what to do about it.',
    ],
  },
  {
    label: 'Sight',
    note: '10',
    body: [
      'Seeing what is there. Also — and the village would say this is the same skill — seeing what is not.',
      'Pim counts eleven crows on the chapel roof. So far you have counted eleven crows on the chapel roof.',
    ],
  },
  {
    label: 'Standing',
    note: 'Stranger',
    body: [
      'What the village calls you when you are not in the room.',
      'Stranger is the starting word and it is not an insult here. The one after it is Guest. Nobody remembers the one after that being used.',
    ],
  },
  {
    label: 'Condition',
    note: 'Road-worn',
    body: [
      'Blistered heel, four nights of poor sleep, a cough that started somewhere past the ford and has not improved.',
      'Vesna Quill will look at it if you ask. She will also tell you what she thinks of people who let a cough go, and you will hear all of it.',
    ],
  },
  {
    label: 'Purse',
    note: '17 bits',
    body: [
      'Seventeen bits, a bent one that no one will take, and a coin from somewhere south that Ysolde turned over twice and handed back.',
      'A bed at the Bell is four. Stew is one. The arithmetic of how long you can stay is not complicated.',
    ],
  },
];

export const EQUIPMENT = [
  {
    label: 'Head',
    note: 'Bare',
    body: [
      'Nothing. The wind off the graveyard finds this out about you within a minute of stepping outside.',
    ],
  },
  {
    label: 'Cloak',
    note: 'Oiled road cloak',
    body: [
      'Waxed wool, brown gone grey, a tear at the left shoulder mended with thread that does not match.',
      'Sheds rain for about an hour and then gives up all at once. You have learned to read the hour.',
    ],
  },
  {
    label: 'Body',
    note: 'Layered kit',
    body: [
      'Linen shirt, wool over it, a leather jerkin that was cut for someone broader.',
      'The jerkin has a repaired puncture below the ribs on the right. You did not make that repair and you did not make that hole.',
    ],
  },
  {
    label: 'Hands',
    note: 'Carter\'s gloves',
    body: [
      'Split across both palms from rope. Warm enough. Useless for anything requiring a fingertip.',
    ],
  },
  {
    label: 'Belt',
    note: 'Iron-buckled strap',
    body: [
      'Four hanging loops, two of them empty, one of them holding a knife and one of them holding a knife-shaped absence you have not explained to yourself.',
    ],
  },
  {
    label: 'Weapon',
    note: 'Hedging knife',
    body: [
      'Twelve inches, heavy at the tip, made for cutting green wood at an angle.',
      'It is a tool and it looks like a tool, which is why Warden Marrow let you keep it at the gate.',
    ],
  },
  {
    label: 'Offhand',
    note: 'Empty',
    body: [
      'Free. Grast said a free hand is worth more than a full one, on the grounds that the ground here is uneven and people fall.',
    ],
  },
  {
    label: 'Feet',
    note: 'Dead man\'s boots',
    body: [
      'Good boots. Better than yours were. Half a size large, packed out with rag.',
      'You took them off a man on the south road who had stopped needing them. You would tell that story if anyone asked and nobody has.',
    ],
  },
  {
    label: 'Charm',
    note: 'Empty',
    body: [
      'The loop of cord at your throat where something used to hang.',
      'Every third villager has glanced at it. Father Emeric looked at it for a long moment and then very deliberately looked at your face instead.',
    ],
  },
];

export const INVENTORY = [
  {
    label: 'Travel bread',
    note: 'x4',
    body: [
      'Hard enough to be a tool. Soaks up stew, which is the only way anyone eats it.',
    ],
  },
  {
    label: 'Tallow candle',
    note: 'x6',
    body: [
      'Burns about two hours and smells like the inside of a butcher\'s.',
      'Six is more than a careful person needs and fewer than the Bell\'s upstairs corridor makes you wish you had.',
    ],
  },
  {
    label: 'Flint and steel',
    note: 'x1',
    body: [
      'Reliable in the dry. In the wet it is two interesting rocks.',
    ],
  },
  {
    label: 'Coil of hemp rope',
    note: '30 ft',
    body: [
      'Carter\'s rope, still smelling of the cart. Frayed at one end where it was cut in a hurry rather than untied.',
    ],
  },
  {
    label: 'Fever powder',
    note: 'x2',
    body: [
      'Bought from Vesna Quill, who wrote the dose on the paper and then said it aloud twice.',
      'One measure in water. Not two. She was extremely clear that it is not two.',
    ],
  },
  {
    label: 'Grave-pin',
    note: 'x1',
    body: [
      'Eight inches of black iron, flattened head, no point worth the name — it is meant to be driven, not to pierce.',
      'Krael sells them by the dozen to one customer. He would not say what they are for. He said to ask Grast, and he said it like a man passing something heavy to someone else.',
    ],
  },
  {
    label: 'Bell-metal shard',
    note: 'x1',
    body: [
      'A curl of bronze the size of a thumbnail, picked up under the Bell\'s sign post.',
      'It is warm. It has been warm since you picked it up, and the weather has not been.',
    ],
  },
  {
    label: 'Sexton\'s tally slip',
    note: 'x1',
    body: [
      'A strip of card with forty-one marks on it in three different hands.',
      'Thirty-eight are the same steady stroke. Three are older, thinner, and were made by somebody who pressed much harder.',
    ],
  },
  {
    label: 'Dried river-mint',
    note: 'x9',
    body: [
      'Grows on the strip behind the chapel. Chewing it takes the taste of the well water out of your mouth, which is a thing several people have now warned you about.',
    ],
  },
  {
    label: 'Waterskin',
    note: 'Half',
    body: [
      'Filled at the ford, two days south. Everyone here has asked where you filled it before they let you drink from it.',
    ],
  },
];

export const COMPANIONS = [
  {
    label: 'Tally Ruin',
    note: 'Wary',
    body: [
      'The third carter. The one that came back, and the only person in Dreadhollow who says so out loud.',
      'Drinks at the Bell from opening. Will not walk the north road for any money and has never once said he would not — he simply is not there when it is time to go.',
      'Would come with you. Would need to be asked at the right hour, and the right hour is early, and he is not easy to find early.',
    ],
  },
  {
    label: 'Pim',
    note: 'Eager — refuse',
    body: [
      'Nine years old, counts crows, misses nothing, and has decided you are leaving and wants to see the gate when you do.',
      'Follows you as far as the well and then stops, because the well is where Mam\'s rule is.',
      'Taking this child anywhere is a decision the village would not forgive, and Pim knows more about the treeline than any adult here will admit to knowing.',
    ],
  },
  {
    label: 'Sexton Grast',
    note: 'Conditional',
    body: [
      'Knows the ground better than anyone alive and carries a shovel he has used for forty-one graves and at least one other purpose.',
      'Will walk out with you at first light and not after dark, and he will not explain the difference in terms you find satisfying.',
      'His condition is that you come back by dusk. He does not say what happens if you do not; he says he will not be the one coming to look.',
    ],
  },
  {
    label: 'Warden Ilse Marrow',
    note: 'Refused',
    body: [
      'Will not leave the gate. That is not stubbornness, it is the entire job, and she has carried back enough to have stopped debating it.',
      'She has offered a different thing instead: if the bell rings and nobody is pulling the rope, she will come to you. That is a promise from a woman who does not make them.',
    ],
  },
  {
    label: 'Bertran Krael',
    note: 'Unasked',
    body: [
      'The smith. Arms like the anvil and no interest whatsoever in leaving the smithy while there is iron in it.',
      'You have not asked. He has made it fairly clear across two conversations that he expects you will, eventually, and that the answer will depend entirely on what you are going out there to do.',
    ],
  },
];
