// What the player has learned about the world: things met, and things owed.
// Same shape as content/character.js — label, note, body. Nothing else is read.
//   Bestiary note  — how well the thing is known: Hearsay, Unconfirmed, Seen, Killed.
//   Quest note     — where it stands: Rumour, Active, Stalled, Closed.

export const BESTIARY = [
  {
    label: 'Chapel crows',
    note: 'Seen',
    body: [
      'Eleven birds on the chapel roof. Always eleven, at any hour, in any weather.',
      'Pim removed one with a stone and counted eleven afterwards. Pim has told exactly one person this and it was you.',
      'They do not scatter when the doors open. They scatter about four seconds before the doors open.',
    ],
  },
  {
    label: 'Fen-lights',
    note: 'Seen',
    body: [
      'Low green lights over the water west of the village, an hour either side of midnight.',
      'The village explanation is marsh gas and the village behaviour is to bolt the shutters on that side, which are two different opinions from the same people.',
      'They keep pace with a walking man. They do not keep pace with a running one — they arrive first.',
    ],
  },
  {
    label: 'The thing on the north road',
    note: 'Hearsay',
    body: [
      'Two carters gone this month. Marrow says what came back fit in one sack and she says it in the flat voice of somebody who packed it.',
      'No description exists because the only witness is Tally Ruin and Tally Ruin has been drinking since March specifically so that one will not exist.',
      'Whatever it is, it works the road and not the village, and nobody can tell you where the line is.',
    ],
  },
  {
    label: 'Barrow-hound',
    note: 'Unconfirmed',
    body: [
      'Something dog-shaped and dog-sized that walks the treeline at dusk without ever coming out of it.',
      'Grast has seen it four times in thirty years and has never once seen it move between two moments of looking. It is always already somewhere else.',
      'The village dogs do not bark at it. They go inside.',
    ],
  },
  {
    label: 'The three older graves',
    note: 'Unconfirmed',
    body: [
      'Different stone, different weathering, and here before the village was. Grast checks them every morning.',
      'Every morning they are exactly as he left them, which he says should be a comfort, and which has stopped being one.',
      'Krael sells grave-pins by the dozen and only to Grast. Nobody has connected these two facts out loud in your hearing.',
    ],
  },
  {
    label: 'Well-taste',
    note: 'Seen',
    body: [
      'The village well came up wrong in Old Coble\'s grandmother\'s time and has stayed wrong: pennies, and under the pennies something else.',
      'It is uncovered on purpose. The Sexton\'s position is that a covered well is a well you have stopped watching, and nobody argues with him about it.',
      'Whatever is in the water is in the water. Nobody has ever said it is in anything else.',
    ],
  },
  {
    label: 'The Bell',
    note: 'Hearsay',
    body: [
      'Ship\'s bell, salvage off a wreck up the coast, hung outside the tavern by Ysolde Fen\'s husband.',
      'It rings itself. He called it the wind, right up until the point where he stopped saying anything at all.',
      'Marrow has left a standing instruction with the whole village: if it rings and nobody is pulling the rope, come and find her.',
    ],
  },
  {
    label: 'Quiet Hour attendance',
    note: 'Unconfirmed',
    body: [
      'At dusk the chapel sits in silence with the doors deliberately open. No sermon, no singing.',
      'Father Emeric keeps the doors open because a shut door is a decision, and he would rather whatever comes be met than kept out.',
      'On three occasions the count of people leaving has matched the count of people arriving, and Emeric has been asked about the other occasions and has answered a different question.',
    ],
  },
];

export const QUESTS = [
  {
    label: 'Don\'t test the treeline',
    note: 'Active',
    body: [
      'Warden Ilse Marrow — at the north gate.',
      'The north road is shut and she is not opening it. Walk the village, drink at the Bell, stay off the treeline after dark.',
      'If the bell rings and nobody is pulling the rope, go and find her. She said this last and she said it slowly.',
    ],
  },
  {
    label: 'Ask Grast about grave-pins',
    note: 'Active',
    body: [
      'Bertran Krael — the smithy.',
      'He would not say what a grave-pin is for. He said to ask the Sexton, and that Grast would be pleased somebody finally did.',
      'You have a grave-pin in your pack. You have not mentioned this to anyone.',
    ],
  },
  {
    label: 'Come at dusk',
    note: 'Active',
    body: [
      'Father Emeric Stang — the chapel.',
      'Sit the Quiet Hour. No sermon, no singing, doors open. He was direct about wanting you there and indirect about why.',
      'It is the only hour anybody in Dreadhollow is honest. That is his description and he did not soften it.',
    ],
  },
  {
    label: 'The third carter',
    note: 'Stalled',
    body: [
      'Tally Ruin — the Bell, from opening onward.',
      'Two went missing. Three went out. He said that and then asked whether you were buying.',
      'He will not go further while he is drinking, and he is drinking on purpose, and pushing him now closes the door for good.',
    ],
  },
  {
    label: 'Do not drink from the well',
    note: 'Closed',
    body: [
      'Old Coble — beside the well.',
      'You did not drink from the well. The rain barrel behind the Green Room is clean and Vesna does not mind.',
      'Coble watched you walk past it and gave you a nod that cost him some effort.',
    ],
  },
  {
    label: 'The sleep draught',
    note: 'Rumour',
    body: [
      'Vesna Quill — the apothecary.',
      'She will not sell the sleep draught twice to the same person inside a month, and she said not to argue before you had opened your mouth.',
      'Somebody has been asking. She did not say who, and the way she did not say who was itself an answer of a kind.',
    ],
  },
  {
    label: 'Eleven crows',
    note: 'Rumour',
    body: [
      'Pim — by the well, most of the day.',
      'There are eleven crows on the chapel roof. There were eleven after one was removed. Pim told nobody until you.',
      'Pim believes you are leaving soon and that this is why it is safe to tell you.',
    ],
  },
  {
    label: 'What the ground remembers',
    note: 'Rumour',
    body: [
      'Sexton Grast — the graveyard.',
      'Forty-one graves. He dug thirty-eight. The other three were here first and do not weather like the rest.',
      'He checks them every morning without being asked to and without telling Father Emeric that he does.',
    ],
  },
];
