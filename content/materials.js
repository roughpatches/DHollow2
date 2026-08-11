// What a building is repaired with. Buildings name these ids in their costs.
//   id    — how content/buildings.js and src/town.js refer to it.
//   name  — shown wherever a cost or a stock is listed.
//   start — how much the player is carrying at the start of the game.
//   body  — what it is, in the world's voice. Yours to write.
// Add a material by adding an entry. Nothing reads this list by position.

export const MATERIALS = [
  { id: 'timber', name: 'Timber', start: 6, body: ['[Placeholder Text]'] },
  { id: 'stone', name: 'Cut stone', start: 4, body: ['[Placeholder Text]'] },
  { id: 'nails', name: 'Nails', start: 12, body: ['[Placeholder Text]'] },
  { id: 'pitch', name: 'Pitch', start: 0, body: ['[Placeholder Text]'] },
  { id: 'canvas', name: 'Canvas', start: 0, body: ['[Placeholder Text]'] },
];
