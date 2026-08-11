// Where the writing isn't done yet. Drop the marker below into any string in content/
// and it shows up here, in the game, on the Script tab — so unwritten text is visible
// from inside the thing rather than tracked in a document that goes stale.

import { NPCS } from '../content/npcs.js';
import { CHARACTER, EQUIPMENT, INVENTORY, COMPANIONS } from '../content/character.js';
import { BESTIARY, QUESTS } from '../content/codex.js';
import { PLACES } from '../content/places.js';
import { SETTINGS } from '../content/settings.js';

// One spelling, so one scan finds every one of them. Case is ignored when matching.
export const PLACEHOLDER = '[Placeholder Text]';

// An NPC with no lines written at all still has to be talkable.
export function linesOf(def) {
  return def.lines && def.lines.length ? def.lines : [PLACEHOLDER];
}

// Every slot a string can sit in, named the way the designer would say it out loud.
function dialogueSlots(npc) {
  return linesOf(npc).map((s, i) => [`line ${i + 1}`, s]);
}

function entrySlots(e) {
  const slots = e.options ? [] : [['note', e.note || '']];
  return slots.concat((e.body || []).map((s, i) => [`paragraph ${i + 1}`, s]));
}

const SOURCES = [
  ['Dialogue', NPCS, (n) => n.name, dialogueSlots],
  ['Equipment', EQUIPMENT, (e) => e.label, entrySlots],
  ['Character', CHARACTER, (e) => e.label, entrySlots],
  ['Companions', COMPANIONS, (e) => e.label, entrySlots],
  ['Inventory', INVENTORY, (e) => e.label, entrySlots],
  ['Bestiary', BESTIARY, (e) => e.label, entrySlots],
  ['Quest Log', QUESTS, (e) => e.label, entrySlots],
  ['Map', PLACES, (e) => e.label, entrySlots],
  ['Settings', SETTINGS, (e) => e.label, entrySlots],
];

const MARK = PLACEHOLDER.toLowerCase();

// [{ source, label, unwritten: ['line 2', ...], total }] — one entry per thing that
// has any unwritten text in it.
export function scan() {
  const out = [];
  for (const [source, items, labelOf, slotsOf] of SOURCES) {
    for (const item of items) {
      const slots = slotsOf(item);
      const unwritten = slots.filter(([, s]) => s.toLowerCase().includes(MARK)).map(([n]) => n);
      if (unwritten.length) out.push({ source, label: labelOf(item), unwritten, total: slots.length });
    }
  }
  return out;
}

const found = scan();

export const PLACEHOLDER_COUNT = found.reduce((n, f) => n + f.unwritten.length, 0);

// The Script tab, in the same label/note/body shape every other tab uses.
export const SCRIPT = found.length
  ? found.map((f) => ({
    label: f.label,
    note: `${f.unwritten.length}/${f.total}`,
    body: [
      `${f.source}. ${f.unwritten.length} of ${f.total} pieces of text here are still ${PLACEHOLDER}.`,
      `Unwritten: ${f.unwritten.join(', ')}.`,
    ],
  }))
  : [{
    label: 'Nothing unwritten',
    note: '—',
    body: [`No ${PLACEHOLDER} anywhere in content/. Every line in the game is authored.`],
  }];

// so the count is visible without opening the game
export function report() {
  if (!found.length) return `Script: all authored, no ${PLACEHOLDER}.`;
  const where = found.map((f) => `${f.source}/${f.label} (${f.unwritten.join(', ')})`).join('; ');
  return `Script: ${PLACEHOLDER_COUNT} unwritten in ${found.length} place(s) — ${where}`;
}
