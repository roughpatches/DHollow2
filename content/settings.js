// The Settings tab. Same label/note/body as the other tabs, plus three fields:
//   id      — how src/settings.js and the code that reads the setting refer to it.
//   options — what the player can cycle through. `name` is shown, `value` is used.
//   start   — index into options that the game boots with.
// The `note` column is filled in from whichever option is current, so these entries
// do not carry one. Values are deliberately relative to tuning.js rather than absolute:
// the designer sets the real number there and the player scales it from here.

export const SETTINGS = [
  {
    id: 'text',
    label: 'Text speed',
    start: 1,
    options: [
      { name: 'Slow', value: 0.5 },
      { name: 'Normal', value: 1 },
      { name: 'Fast', value: 2 },
      { name: 'Instant', value: 999 },
    ],
    body: [
      'How fast dialogue letters in. A multiple of the base speed set in tuning.js.',
      'Instant prints the whole line at once, so E only ever advances rather than catching up.',
    ],
  },
  {
    id: 'view',
    label: 'View',
    start: 1,
    options: [
      { name: 'Close', value: 1 },
      { name: 'Normal', value: 0 },
      { name: 'Wide', value: -1 },
    ],
    body: [
      'How much of the world fits on screen. Steps the camera zoom up or down from the base in tuning.js.',
      'Wide shows more of the village at once and makes the pixels smaller. Close does the reverse.',
    ],
  },
  {
    id: 'camera',
    label: 'Camera',
    start: 0,
    options: [
      { name: 'Smooth', value: 0.2 },
      { name: 'Locked', value: 1 },
    ],
    body: [
      'Whether the camera drifts after you or stays fixed on you.',
      'Smooth lags a little behind a change of direction, which reads better in the open. Locked never drifts, which is steadier indoors and easier on the eye.',
    ],
  },
  {
    id: 'prompt',
    label: 'Dialogue prompt',
    start: 0,
    options: [
      { name: 'Shown', value: true },
      { name: 'Hidden', value: false },
    ],
    body: [
      'The [E] marker in the corner of the dialogue box.',
      'Hiding it does not change the controls — E and Space still advance a line.',
    ],
  },
  {
    id: 'pins',
    label: 'Map pins',
    start: 0,
    options: [
      { name: 'All', value: 'all' },
      { name: 'Doors only', value: 'doors' },
      { name: 'None', value: 'none' },
    ],
    body: [
      'What gets marked on the Map tab besides your own position.',
      'All shows doors and everyone standing on that map. None leaves the ground bare, which is the honest version — nobody in Dreadhollow is keeping a map of where people are.',
    ],
  },
];
