// Who will walk out with you, and why the rest will not.
//
// Every job asks for a bond of recruitBase. Work a character's trait is drawn to asks
// less of them; work that touches a fear or a scruple asks a great deal more. What is
// left is a band, and they come if they are at it. The arithmetic is deliberately small
// enough to show on screen, because a refusal the player cannot account for is a bug
// they will report as unfairness.

import { TUNING } from '../tuning.js';
import { FEARS } from '../content/fears.js';
import { roster, charOf, traitsOf, bandOf, bandName } from './party.js';

const FEAR = Object.fromEntries(FEARS.map((f) => [f.id, f]));

for (const c of roster()) {
  const bad = (c.fears || []).filter((f) => !FEAR[f]);
  if (bad.length) console.warn(`${c.name}: no such fear — ${bad.join(', ')}`);
}

export function fearOf(id) {
  return FEAR[id];
}

// a run after dark is dark work, whatever else the job is
export function tagsFor(quest, when) {
  const tags = [...(quest.tags || [])];
  if (when === 'night' && !tags.includes('dark')) tags.push('dark');
  return tags;
}

export function asked(id, quest, when) {
  const tags = tagsFor(quest, when);
  const draws = traitsOf(id).filter((t) => (t.draws || []).some((d) => tags.includes(d)));
  const fears = (charOf(id).fears || []).filter((f) => tags.includes(f)).map((f) => FEAR[f]);

  const band = Math.max(0, Math.min(
    TUNING.bondNames.length - 1,
    TUNING.recruitBase - draws.length * TUNING.recruitDraw + fears.length * TUNING.recruitFear,
  ));
  return { draws, fears, band, has: bandOf(id), willing: bandOf(id) >= band };
}

export function willing(quest, when) {
  return roster().filter((c) => asked(c.id, quest, when).willing).map((c) => c.id);
}

export function enough(quest, when) {
  return willing(quest, when).length >= (quest.party || 1);
}

// --- text ------------------------------------------------------------------
// Flat and mechanical on purpose: this is a readout, not a voice. Rewrite freely.

export function why(id, quest, when) {
  const a = asked(id, quest, when);
  const bits = [];
  if (a.draws.length) {
    bits.push(`${a.draws.map((t) => t.name).join(' and ')} ${a.draws.length > 1 ? 'draw' : 'draws'} them`);
  }
  if (a.fears.length) {
    bits.push(a.fears
      .map((f) => (f.kind === 'scruple' ? `${f.name} is not work they will do` : `${f.name} is not something they will face`))
      .join(', '));
  }
  const need = `Asks ${bandName(a.band)}; they are ${bandName(a.has)}.`;
  return bits.length ? `${bits.join('. ')}. ${need}` : need;
}
