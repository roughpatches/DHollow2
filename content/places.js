// The Map tab. Same label/note/body as the other tabs, plus two fields it alone reads:
//   map — which grid in content/maps.js to draw. Required; an entry without it is a list row.
//   at  — optional [x, y] tile to ring on that map, for a landmark inside a larger place.
// Doors, everyone standing on the map, and the player's own position are drawn from the
// live world, so a place only needs writing about once and never needs its pins updating.

export const PLACES = [
  {
    label: 'Dreadhollow',
    note: 'Open ground',
    map: 'village',
    body: [
      'One road in, one road out, and the second one is shut. Four doors worth knocking on, a well nobody drinks from, and a graveyard with three stones too many.',
      'The whole of it walks end to end in under two minutes. People here say that like it is a comfort.',
    ],
  },
  {
    label: 'The Drowned Bell',
    note: 'Indoors',
    map: 'tavern',
    body: [
      'Ysolde Fen keeps the door open and the fire lit, and says that is the whole of what she promises.',
      'Ale is thin, stew is honest, beds upstairs are dry three nights in four. Take the back room — the front one looks over the graveyard and people do not sleep in it.',
      'The bell itself hangs outside on the post, salvage off a wreck up the coast, and it is not on any map because nobody wants to mark it.',
    ],
  },
  {
    label: "Krael's Forge",
    note: 'Indoors',
    map: 'smithy',
    body: [
      'Cinder floor, and Bertran Krael will tell you to keep left across it before he tells you anything else.',
      'Leave work on the bench and come back tomorrow. He does not wait while you watch.',
      'Nails, hinges, hooks, and grave-pins. Mostly grave-pins, lately, and all of those go to one customer.',
    ],
  },
  {
    label: 'The Green Room',
    note: 'Indoors',
    map: 'apothecary',
    body: [
      'Vesna Quill\'s shelves, half of which are only medicine at the right weight, and she will say so before you touch anything.',
      'Fever, ache, sleep, wounds that will not close — something for each and a warning attached to it.',
      'Rain barrel out back is clean water, whatever anyone has told you about the well. They are right about the well.',
    ],
  },
  {
    label: 'Chapel of the Quiet Hour',
    note: 'Indoors',
    map: 'chapel',
    body: [
      'Four ranks of pews, an altar, and Father Emeric Stang, who will tell you the pews are all equally unkind.',
      'At dusk the village sits here in silence. No sermon, no singing. It began as mourning and has become the only hour anybody in Dreadhollow is honest.',
      'The doors stay open through it, on purpose, because a shut door is a decision and he would rather whatever comes be met than kept out.',
    ],
  },
  {
    label: 'The village well',
    note: 'Landmark',
    map: 'village',
    at: [22, 13],
    body: [
      'Went sour in Old Coble\'s grandmother\'s time and has stayed sour. Comes up tasting of pennies and something under the pennies.',
      'It is kept uncovered deliberately. The Sexton holds that a covered well is a well you have stopped watching, and for once nobody argues with him.',
      'It is also where Pim stops. Whatever Mam\'s rule is, the well is the edge of it.',
    ],
  },
  {
    label: 'The graveyard',
    note: 'Landmark',
    map: 'village',
    at: [25, 23],
    body: [
      'Forty-one graves in two ranks below the road. Sexton Grast dug thirty-eight of them.',
      'The other three were here before the village was. Different stone, and it does not weather the way the rest does.',
      'He checks them every morning without being asked, and every morning they are exactly as he left them.',
    ],
  },
  {
    label: 'The black water',
    note: 'Landmark',
    map: 'village',
    at: [5, 24],
    body: [
      'Standing water along the south-west edge, too still for its size and never once frozen in a frost that shut the road.',
      'The fen-lights come up over it about an hour either side of midnight. The village calls that marsh gas and then bolts the shutters on that side.',
      'The lights keep pace with a walking man. They do not keep pace with a running one — they arrive first.',
    ],
  },
  {
    label: 'The crossroads',
    note: 'Landmark',
    map: 'village',
    at: [19, 10],
    body: [
      'Where the north road crosses the village lane. Everything in Dreadhollow is reached from this square of packed path.',
      'Stand here at dusk and you can watch the whole village walk to the chapel without one of them looking up the north road.',
    ],
  },
  {
    label: 'The north road',
    note: 'Shut',
    map: 'village',
    at: [19, 2],
    body: [
      'Warden Ilse Marrow holds the top of it and is not opening it. That is the entire job and she has stopped debating it.',
      'Two carters gone this month. What came back fit in one sack, and she is the one who packed it.',
      'Three went out. Only Tally Ruin says so, and he says it at the Bell, to people who have decided not to ask him twice.',
    ],
  },
];
