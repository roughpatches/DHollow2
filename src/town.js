// What state the town is in: how far each building has been repaired, what the player
// is carrying to repair it with, and what has already been paid toward the next stage.
// content/buildings.js says what a building is; this says where it has got to.

import { BUILDINGS } from '../content/buildings.js';
import { MATERIALS } from '../content/materials.js';

const MATERIAL = Object.fromEntries(MATERIALS.map((m) => [m.id, m]));

// Everything any building anywhere asks for, derived rather than written down, so a
// material stops being a building material by leaving the last cost that names it. A
// pack of trout is not an answer to what the chapel wants, and the panel below says so.
const BUILDABLE = new Set(BUILDINGS.flatMap((b) => b.stages.flatMap((s) => Object.keys(s.cost || {}))));

const held = new Map(MATERIALS.map((m) => [m.id, m.start]));
const level = new Map(BUILDINGS.map((b) => [b.id, b.level]));
// part-paid stages persist: you can bring four timber now and the rest tomorrow
const paid = new Map(BUILDINGS.map((b) => [b.id, {}]));

for (const b of BUILDINGS) {
  for (const s of b.stages) {
    const bad = Object.keys(s.cost || {}).filter((m) => !MATERIAL[m]);
    if (bad.length) console.warn(`${b.name}, ${s.name}: no such material — ${bad.join(', ')}`);
  }
}

export function buildings() {
  return BUILDINGS;
}

export function buildingOf(id) {
  return BUILDINGS.find((b) => b.id === id);
}

export function levelOf(id) {
  return level.get(id);
}

export function stageOf(id) {
  return buildingOf(id).stages[levelOf(id)];
}

export function isOpen(id) {
  return !!stageOf(id).open;
}

export function nameOf(mid) {
  return MATERIAL[mid] ? MATERIAL[mid].name : mid;
}

export function stock() {
  return MATERIALS.map((m) => [m.id, held.get(m.id)]);
}

// how much of one thing is in the pack — what a recipe's cost is counted against
export function heldOf(mid) {
  return held.get(mid) || 0;
}

// What the Inventory tab shows above the kit the character set out with, in the same
// {label, note, body} shape every tab uses. A material at none is not carried and does
// not take a square; it appears the moment a run brings some home. The icon is the
// material's own id — see src/icons.js.
export function carriedRows() {
  return MATERIALS.filter((m) => held.get(m.id) > 0).map((m) => ({
    label: m.name,
    note: `x${held.get(m.id)}`,
    icon: m.id,
    mid: m.id, // what it is, for the one tab that does something to a thing rather than list it
    body: m.body,
  }));
}

export function give(mid, n) {
  held.set(mid, (held.get(mid) || 0) + n);
  return held.get(mid);
}

// what is still owed toward the next stage; null once a building is finished
export function remaining(id) {
  const cost = stageOf(id).cost;
  if (!cost) return null;
  const p = paid.get(id);
  const out = {};
  for (const [m, n] of Object.entries(cost)) {
    const left = n - (p[m] || 0);
    if (left > 0) out[m] = left;
  }
  return out;
}

// Hand over everything carried that this building still wants. Takes what it can and
// leaves the rest owing, so a stage can be paid off across several visits.
export function contribute(id) {
  const rem = remaining(id);
  if (!rem) return { taken: {}, levelled: false };

  const p = paid.get(id);
  const taken = {};
  for (const [m, need] of Object.entries(rem)) {
    const n = Math.min(need, held.get(m) || 0);
    if (n > 0) {
      held.set(m, held.get(m) - n);
      p[m] = (p[m] || 0) + n;
      taken[m] = n;
    }
  }

  const levelled = Object.keys(remaining(id)).length === 0;
  if (levelled) {
    level.set(id, levelOf(id) + 1);
    paid.set(id, {});
  }
  return { taken, levelled };
}

// --- text -----------------------------------------------------------------
// Flat and mechanical on purpose: this is a readout, not a voice. Rewrite freely.

function list(pairs) {
  return pairs.map(([m, n]) => `${n} ${nameOf(m)}`).join(', ');
}

export function statusLines(id) {
  const b = buildingOf(id);
  const s = stageOf(id);
  const lines = [`${b.name} — ${s.name}.`, s.note];
  const rem = remaining(id);
  if (!rem) {
    lines.push('Nothing more is wanted here.');
  } else {
    lines.push(`Still wanted: ${list(Object.entries(rem))}.`);
    const useful = stock().filter(([m, n]) => n > 0 && BUILDABLE.has(m));
    lines.push(`You are carrying: ${list(useful) || 'nothing useful'}.`);
  }
  return lines;
}

export function contributeLines(id, result) {
  const took = Object.entries(result.taken);
  if (!took.length) {
    const rem = remaining(id);
    return rem
      ? [`${buildingOf(id).name} — nothing you are carrying is wanted here.`, `Still wanted: ${list(Object.entries(rem))}.`]
      : statusLines(id);
  }
  const lines = [`You leave ${list(took)}.`];
  if (result.levelled) {
    const s = stageOf(id);
    lines.push(`${buildingOf(id).name} is now ${s.name}.`, s.note);
    if (remaining(id)) lines.push(`Next stage wants: ${list(Object.entries(remaining(id)))}.`);
  } else {
    lines.push(`Still wanted: ${list(Object.entries(remaining(id)))}.`);
  }
  return lines;
}
