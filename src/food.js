// What a meal does, and where it is eaten.
//
// Food is a material in content/materials.js carrying `eat`, and `eat` is the whole of it:
//   con — constitution straight back into the pool, and never past what the run set out
//         with. A meal puts back what the road took; it does not make a party fitter than
//         they were at the gate.
//   hp  — hit points back to everybody still on their feet, each to their own maximum. It
//         is one pot and four bowls: a meal is shared or it is not a meal.
// Nothing else in the game reads food. A new dish is one entry in content/materials.js
// with `eat` on it and a recipe in content/recipes.js to cook it; a new kind of thing food
// can do is a field here and the line in src/run.js that applies it.
//
// Food is eaten at a camp and nowhere else, out of the pack the party carried out. It is
// not sold, not eaten in town, and not eaten standing in front of a boar — the same rule
// the pack is opened by, for the same reason.
//
// A meal is not a potion. Nothing lingers, so there is no one-at-a-time rule and no
// clearing up after a run: what it gives it gives the moment it is eaten, and after that
// there is only an empty pan. That is also why a party can eat four times over if they
// carried four dinners — the limit on food is the room in the pack and the fish in the
// stream, which is a limit the road already enforces.

import { MATERIALS } from '../content/materials.js';
import { nameOf } from './town.js';

const FOOD = Object.fromEntries(MATERIALS.filter((m) => m.eat).map((m) => [m.id, m]));

export function isFood(mid) {
  return !!FOOD[mid];
}

export function effectOf(mid) {
  return (FOOD[mid] && FOOD[mid].eat) || {};
}

export function foods() {
  return Object.values(FOOD);
}

// What is in the given store that could be eaten. There is no second question to ask —
// having it is the whole of being able to eat it.
export function carried(store) {
  return Object.keys(FOOD).filter((mid) => store.heldOf(mid) > 0);
}

export function canEat(mid, store) {
  return isFood(mid) && store.heldOf(mid) > 0;
}

// Eat one. The dish comes out of the store and what it was worth is handed back, for
// whoever is holding the pool and the hit points to apply — see src/run.js.
export function eat(mid, store) {
  if (!canEat(mid, store)) return null;
  store.take(mid, 1);
  return { mid, name: nameOf(mid), effect: effectOf(mid) };
}

// A dish's numbers said in words, because a number on its own on a card is a puzzle.
export function linesFor(mid) {
  const e = effectOf(mid);
  const out = [];
  if (e.con) out.push(`${e.con} constitution back into the pool.`);
  if (e.hp) out.push(`${e.hp} hit points back to everybody still standing.`);
  return out;
}
