// The opening. A list of steps, played in order the first time its map is entered.
// One verb per step:
//   wait  — milliseconds of nothing.
//   walk  — { walk: npcId, to: [x, y] } moves them there at walking pace.
//   face  — { face: npcId, dir: 'down' } turns them on the spot.
//   say   — { say: npcId, lines: [...] } opens the dialogue box with their portrait.
//           `beat` is a note to whoever writes the lines; it is never shown.
//   prone — { prone: true } lays the player out; false stands them up.
//   fade  — { fade: 'out' | 'in', ms }.
//   go    — { go: mapKey, spawn: [x, y] } ends the scene and loads that map.
// Add a step by adding a line. The scene plays once per game; src/script.js remembers.

export const OPENING = {
  map: 'shore',
  steps: [
    { prone: true },
    { wait: 1400 },
    { walk: 'aldis', to: [24, 8] },
    { wait: 500 },
    { walk: 'aldis', to: [19, 8] },
    { face: 'aldis', dir: 'left' },
    { wait: 700 },
    {
      say: 'aldis',
      beat: 'Comes over the strand after the storm, sees the body, takes it for a dead one.',
      lines: ['[Placeholder Text]'],
    },
    { walk: 'aldis', to: [18, 8] },
    { wait: 900 },
    {
      say: 'aldis',
      beat: 'Finds they are breathing. Surprise, then straight to what has to be done about it.',
      lines: ['[Placeholder Text]'],
    },
    { prone: false },
    { wait: 400 },
    {
      say: 'aldis',
      beat: 'Carrying them in. The warning: it is not safe out after dark, and the town limits do not help.',
      lines: ['[Placeholder Text]'],
    },
    { fade: 'out', ms: 1100 },
    { go: 'village', spawn: [19, 12] },
  ],
};
