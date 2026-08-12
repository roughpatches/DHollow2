// Scripted scenes. A scene plays the first time its map is entered and never again.
// One verb per step:
//   wait    — milliseconds of nothing.
//   walk    — { walk: npcId, to: [x, y] } moves them there at walking pace.
//   face    — { face: npcId, dir: 'down' } turns them on the spot.
//   say     — { say: npcId, lines: [...] } opens the dialogue box with their portrait.
//   narrate — { narrate: [...] } the same box with nobody speaking, for what the player
//             notices rather than what anyone says to them.
//   choose  — { choose: ['[Nod.]', ...] } puts the options in the box and waits. The
//             player never speaks, so every option is something they do. Which one they
//             took is not recorded: these all reconverge on the next step.
//   name    — { name: true } asks the player what they are called and waits. Once, in
//             the hut. See src/scenes/Name.js. {playerName} in any line is filled in
//             with it as the line is shown.
//   prone   — { prone: true } lays the player out; false stands them up.
//   skills  — { skills: true } hands the player the skill sheet and waits while they
//             fill it in. Once, in the hut. See src/scenes/Skills.js.
//   fade    — { fade: 'out' | 'in', ms }.
//   go      — { go: mapKey, spawn: [x, y] } ends the scene and loads that map.
//   flag    — { flag: 'name' } raises a story flag. See src/story.js.
// 'player' works anywhere an npcId does, for walk and face.
// `beat` on a say or narrate is a note to whoever writes the lines. It is never shown —
// it is where a delivery note like "flat, quiet" or "to himself" lives, so the box holds
// only what is actually said.
// The first scene's map is where the game boots. Add a scene by adding a block.

export const SCENES = [
  {
    id: 'washedup',
    map: 'shore',
    steps: [
      { prone: true },
      { wait: 1400 },
      {
        say: 'aldis',
        beat: 'Distant, down the strand. No player control.',
        lines: ['HEY!'],
      },
      { walk: 'aldis', to: [24, 8] },
      { wait: 300 },
      { walk: 'aldis', to: [18, 8] },
      { face: 'aldis', dir: 'left' },
      { wait: 500 },
      {
        say: 'aldis',
        beat: 'Hands turning the player over. Vision swims, brightens.',
        lines: [
          'Okay. Okay okay okay. You\'re fine. You\'re going to be completely fine.',
        ],
      },
      {
        say: 'aldis',
        beat: 'To himself.',
        lines: [
          "I've done this. I've done this on a dog. It's the same. It's basically the same thing—",
        ],
      },
      {
        say: 'aldis',
        lines: ['Come on. Breathe. Breathe—'],
      },
      { wait: 900 }, // the player coughs hard
      {
        say: 'aldis',
        lines: ['HA! Yes! Yes, okay — see? See, I said. Completely fine.'],
      },
      {
        say: 'aldis',
        lines: ["Don't try to talk. Squeeze my hand if you can hear me."],
      },
      { choose: ['[Squeeze his hand.]', '[Do nothing.]'] },
      {
        say: 'aldis',
        lines: [
          "You're a long way from anywhere. Nothing runs this coast. Nothing's run it in years… but that's a tomorrow question.",
        ],
      },
      {
        say: 'aldis',
        beat: "He tries to get the player upright. Their legs don't hold. Vision tilts.",
        lines: [
          "We do need to go. Now-ish. The light's going, and we don't want to be out when the sun goes down.",
        ],
      },
      {
        narrate: ['Something carries across the water. Long, low, wrong. Not a gull.'],
        beat: 'Aldis stops talking. Everything bright in him goes out.',
      },
      {
        say: 'aldis',
        beat: 'Flat, quiet.',
        lines: ['Up. Now.'],
      },
      { fade: 'out', ms: 120 }, // hard cut to black
      { wait: 2000 },
      { go: 'hut', spawn: [8, 10] },
    ],
  },
  {
    id: 'morning',
    map: 'hut',
    steps: [
      { prone: true },
      { fade: 'in', ms: 1400 },
      { wait: 900 },
      {
        say: 'aldis',
        lines: ['Oh — hey! You\'re up!', "That's great. That's really, really great."],
      },
      {
        say: 'aldis',
        lines: [
          'Here. Drink that.',
          "It's mostly hot water. There's yarrow in it, and some bark off the — you know what, it's fine. It's good. My mother made it and it works.",
        ],
      },
      {
        say: 'aldis',
        lines: [
          "So what ship were you on? Because I've been sat here half the night trying to make it add up and I can't.",
          'Nothing comes through the strait any more.',
        ],
      },
      { wait: 1200 }, // he waits, genuinely expecting an answer
      {
        say: 'aldis',
        lines: ["...You don't know."],
      },
      { choose: ['[Shake your head.]', '[Look at your hands.]', '[Say nothing.]'] },
      {
        say: 'aldis',
        lines: ["Okay. Um — where'd you sail from?"],
      },
      { wait: 900 },
      {
        say: 'aldis',
        lines: ['Where were you sailing to?'],
      },
      { wait: 900 },
      {
        say: 'aldis',
        lines: ['Huh.'],
      },
      {
        say: 'aldis',
        beat: 'He works out how to be reassuring about this, out loud, in real time.',
        lines: [
          "Alright. Let's find out what's still in there. Easy one first.",
          "What's your name?",
        ],
      },
      { name: true },
      { skills: true },
      { prone: false },
      { face: 'aldis', dir: 'right' },
      { wait: 500 },
      {
        say: 'aldis',
        lines: ['{playerName}.'],
      },
      {
        say: 'aldis',
        lines: [
          "You landed somewhere good, by the way. I know it doesn't look it.",
          "Everyone leaves. Everyone's been leaving for years, and I get it, I do.",
        ],
      },
      {
        say: 'aldis',
        lines: [
          "But the harbour's still deep. The soil's still good. The woods are still full — I was up past the treeline last week, {playerName}, and there's more game up there than there's been in my life.",
          "The bones are all here. Nothing's actually broken. People just stopped.",
          'It comes back. It just needs people in it.',
        ],
      },
      { choose: ['[Nod.]', '[Look around the room.]', '[Say nothing.]'] },
      {
        say: 'aldis',
        beat: "Slight deflation. He's heard himself.",
        lines: ['...Gregorious says I say that too much.'],
      },
      {
        say: 'aldis',
        beat: 'Sea Hag pointer.',
        lines: [
          "Which — right, go and see him. The Sea Hag, on the harbour road. Can't miss it, it's the only place with the fire lit.",
        ],
      },
      {
        say: 'aldis',
        lines: [
          "If a ship went down out there, he'll know. If anyone ever came through here looking for someone shaped like you, he'll know that too.",
          "He'll be miserable about it. Don't take it personally, he's miserable about weather.",
        ],
      },
      {
        say: 'aldis',
        lines: [
          'One thing, though.',
          "Be inside by dark. Every night. I don't care what you're doing or how close you are to done.",
        ],
      },
      {
        say: 'aldis',
        lines: ["It's fine! It's completely manageable, you just have to be sensible—"],
      },
      { face: 'aldis', dir: 'down' }, // he stops, and looks at the door
      { wait: 900 },
      {
        say: 'aldis',
        lines: ['Be inside by dark.'],
      },
      { fade: 'out', ms: 1100 },
      { go: 'village', spawn: [16, 16] },
    ],
  },
  {
    // Outside Aldis's cabin. Grey light, wet stone, the harbour below. No dialogue: the
    // scene exists to fade the town in and hand the player their feet.
    id: 'dreadhollow',
    map: 'village',
    steps: [
      { fade: 'in', ms: 1600 },
    ],
  },
  {
    id: 'seahag',
    map: 'tavern',
    steps: [
      { wait: 400 },
      { walk: 'player', to: [12, 7] },
      { face: 'player', dir: 'up' },
      { wait: 500 },
      {
        say: 'gregorious',
        beat: 'He looks up. Sees the player.',
        lines: ['Ah.'],
      },
      {
        say: 'gregorious',
        lines: ['Sit anywhere. You\'ve the run of the place, as you can see.'],
      },
      {
        say: 'gregorious',
        lines: [
          "You'd be the one Aldis pulled off the point. Half-drowned, no ship, no story.",
          "He was in here at dawn to tell me about it. Very excited. He gets like that. It's a whole thing.",
        ],
      },
      {
        say: 'gregorious',
        lines: ["You've a name, he said?"],
      },
      {
        narrate: ['{playerName}.'],
        beat: 'The player indicates their name.',
      },
      {
        say: 'gregorious',
        lines: ['{playerName}. Hm.'],
      },
      {
        say: 'gregorious',
        lines: [
          "Right. You'll want the town. Everyone does, eventually.",
          'Dreadhollow was a stop. Not a grand one — nobody ever wrote a song. Imperial road came down over the ridge and ran to that harbour. Ships in, ships out. Tax man twice a year, which tells you it was worth taxing.',
        ],
      },
      {
        say: 'gregorious',
        lines: ['Then the Empire went.'],
      },
      {
        say: 'gregorious',
        lines: ['Then the mail stopped. Then the garrison walked out one morning. Didn\'t muster, didn\'t say goodbye.'],
      },
      {
        say: 'gregorious',
        lines: [
          'Then the road closed. Grew over in a season and a half — two hundred years of imperial stonework, gone green like it was never laid.',
        ],
      },
      {
        say: 'gregorious',
        lines: [
          'And then the things in the dark came back.',
          "We had forty houses. Now there's eleven with anybody in them.",
        ],
      },
      {
        say: 'gregorious',
        lines: [
          "Now. He'll have told you the bones are all here. Harbour's deep, soil's good, woods are full.",
        ],
      },
      { choose: ['[Nod.]', '[Say nothing.]'] },
      {
        say: 'gregorious',
        lines: [
          "He's not wrong. That's the maddening part of it.",
          "A town doesn't die because the ground turns bad, {playerName}. It dies because the money stops moving. Nobody buys, so nobody makes, so nobody stays, so nobody buys.",
        ],
      },
      {
        say: 'gregorious',
        lines: [
          "You want to fix this place, you don't need a hero.",
          'You need a customer.',
        ],
      },
      {
        say: 'gregorious',
        beat: 'The debt.',
        lines: [
          'Which brings me round to Aldis.',
          "That boy went out to the point, at dusk, in a storm, for a body he'd never met.",
        ],
      },
      { flag: 'firstday-offered' },
      {
        say: 'gregorious',
        lines: [
          "He will never mention it, but square up with him anyway. He's heading out for me to gather some materials to make repairs to the Hag.",
          "I'm sure he could use the company, and maybe some fresh air will help you get your memory sorted.",
        ],
      },
      {
        say: 'gregorious',
        lines: ['Doors close at dark. Be somewhere by then.'],
      },
    ],
  },
];

// where the game boots
export const OPENING = SCENES[0];
