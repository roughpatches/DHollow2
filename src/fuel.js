// What burns, what it is worth, and how long what was laid on will last.
//
// Three benches in town are somebody standing over heat — the crucible, the kitchen fire
// and the still — and all three are on one clock: a recipe says how much fuel the job
// wants in `fuel`, the pack is emptied of the cheapest thing that covers it, and the work
// has to be finished before it burns through. Nothing else in the game reads this: a wheel
// is not a fire, and a node on the road brings its own.
//
// The pack is taken from the cheap end first, so a party's heartwood and its coal are
// still there when something wants them, and the fire is only ever laid with what nothing
// else was waiting for.

import { TUNING } from '../tuning.js';
import { heldOf, nameOf } from './town.js';

// Everything that burns, worst first — the order the fire is laid in.
function ladder() {
  return Object.entries(TUNING.fuel.worth).sort((a, b) => a[1] - b[1]);
}

// What would go on the fire for a job wanting `want` units, out of what is carried. Taken
// from the cheap end until the want is covered, so what is loaded is usually a little over
// it — a branch does not burn half way through and stop.
//
// `spoken` is anything the recipe has already claimed for itself: the clamp burns branches
// to make coal out of branches, and the wood in the stack is not also the wood under it.
// Passing the costs keeps the fire off them.
//   take  — what comes out of the pack, [id, n] each
//   worth — what that adds up to on the fire
//   short — how much of the want nothing in the pack can cover. Measured against the
//           want and not the spare above it: a fire laid with exactly enough is still a
//           fire, it is only a tighter one.
export function lay(want, spoken = {}) {
  const need = want * (1 + TUNING.fuel.spare);
  const take = [];
  let worth = 0;
  for (const [mid, each] of ladder()) {
    if (worth >= need) break;
    const have = heldOf(mid) - (spoken[mid] || 0);
    if (have <= 0) continue;
    const n = Math.min(have, Math.ceil((need - worth) / each));
    take.push([mid, n]);
    worth += n * each;
  }
  return { take, worth, short: Math.max(0, want - worth) };
}

// How long a fire laid with that much is alight for, in seconds.
export function burnSeconds(worth) {
  return worth * TUNING.fuel.secondsPerUnit;
}

// what the bench says it is about to burn, before anything is committed
export function layLine(want, laid) {
  if (!want) return null;
  if (laid.short) {
    return `Fire: ${want} of fuel, and there is not the wood for it. Bring back branches, or coal off a face.`;
  }
  const sec = Math.round(burnSeconds(laid.worth));
  return `Fire: burns ${laid.take.map(([m, n]) => `${n} ${nameOf(m)}`).join(', ')} — ${sec} seconds of it.`;
}
