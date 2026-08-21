// Where the writing isn't done yet. Drop the marker below into any string in content/
// and scan() finds it, so unwritten text is counted off the content itself rather than
// tracked in a document that goes stale. report() prints the count at startup.

import { NPCS } from '../content/npcs.js';
import { INVENTORY, COMPANIONS } from '../content/character.js';
import { QUESTS } from '../content/codex.js';
import { PLACES } from '../content/places.js';
import { SETTINGS } from '../content/settings.js';
import { PARTY } from '../content/party.js';
import { SKILLS } from '../content/skills.js';
import { BUILDINGS } from '../content/buildings.js';
import { MATERIALS } from '../content/materials.js';
import { QUESTS as JOBS } from '../content/quests.js';
import { ENCOUNTERS } from '../content/encounters.js';
import { DRAWN_KINDS } from './nodes.js';
import { FEARS } from '../content/fears.js';
import { SCENES } from '../content/scenes.js';

// One spelling, so one scan finds every one of them. Case is ignored when matching.
export const PLACEHOLDER = '[Placeholder Text]';

// An NPC with no lines written at all still has to be talkable.
export function linesOf(def) {
  return def.lines && def.lines.length ? def.lines : [PLACEHOLDER];
}

// Every slot a string can sit in, named the way the designer would say it out loud.
function dialogueSlots(npc) {
  if (npc.silent) return []; // nobody can talk to them; there is nothing to write
  if (npc.says) {
    return npc.says.flatMap((a, i) => a.lines.map((s, j) => [`answer ${i + 1} line ${j + 1}`, s]));
  }
  return linesOf(npc).map((s, i) => [`line ${i + 1}`, s]);
}

function entrySlots(e) {
  const slots = e.options ? [] : [['note', e.note || '']];
  return slots.concat((e.body || []).map((s, i) => [`paragraph ${i + 1}`, s]));
}

// party and skill entries name themselves and derive their note, so only the prose
// in `body` is text somebody has to write
function proseSlots(e) {
  return (e.body || []).map((s, i) => [`paragraph ${i + 1}`, s]);
}

// An encounter is prose, the line said about it at a fork, what is said either way on
// its roll, and — where it has them — every paragraph of every beat.
function encounterSlots(e) {
  const slots = proseSlots(e);
  if (e.read) slots.push(['fork line', e.read.line]);
  // A harvest with nothing written for it reads as the placeholder, because a line that
  // is missing wants writing exactly as much as one that says so. Its `offer` is not
  // counted: the work card shows the way and nothing under it, so that line goes nowhere
  // and text nobody can read is not text anybody has to write.
  for (const h of e.harvests || []) {
    slots.push([`${h.activity} way`, h.text || PLACEHOLDER]);
    for (const how of ['well', 'middling', 'botched']) {
      slots.push([`${h.activity} ${how}`, (h.done && h.done[how]) || PLACEHOLDER]);
    }
  }
  if (e.check) slots.push(['held', e.check.held], ['lost', e.check.lost]);
  for (const b of e.beats || []) {
    (b.text || []).forEach((p, i) => slots.push([`${b.id} ${i + 1}`,
      typeof p === 'string' ? p : (p.cry || p.line)]));
    (b.choose || []).forEach((o, i) => slots.push([`${b.id} option ${i + 1}`, o.text]));
  }
  return slots;
}

// a scripted scene's lines are written by whoever wrote the scene, and go unwritten
// the same way anyone's do
const SCENE_ROWS = SCENES.map((sc) => ({
  label: sc.id,
  body: sc.steps.flatMap((s) => s.narrate || s.lines || s.choose || []),
}));

const SOURCES = [
  ['Dialogue', NPCS, (n) => n.name, dialogueSlots],
  ['Scenes', SCENE_ROWS, (s) => s.label, proseSlots],
  ['Party', PARTY, (c) => c.name, proseSlots],
  ['Skills', SKILLS, (t) => t.name, proseSlots],
  ['Buildings', BUILDINGS, (b) => b.name, proseSlots],
  ['Materials', MATERIALS, (m) => m.name, proseSlots],
  ['Jobs', JOBS, (q) => q.label, proseSlots],
  ['Encounters', ENCOUNTERS, (e) => e.name, encounterSlots],
  // the drawn nodes, read in the shape run.js walks them: a resource node's prose is its
  // own, and an encounter node's is spent on the cards its two ways are asked from
  ['Nodes', DRAWN_KINDS, (e) => e.name, encounterSlots],
  ['Fears', FEARS, (f) => f.name, proseSlots],
  ['Companions', COMPANIONS, (e) => e.label, entrySlots],
  ['Inventory', INVENTORY, (e) => e.label, entrySlots],
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

// so the count is visible without opening the game
export function report() {
  if (!found.length) return `Script: all authored, no ${PLACEHOLDER}.`;
  const where = found.map((f) => `${f.source}/${f.label} (${f.unwritten.join(', ')})`).join('; ');
  return `Script: ${PLACEHOLDER_COUNT} unwritten in ${found.length} place(s) — ${where}`;
}
