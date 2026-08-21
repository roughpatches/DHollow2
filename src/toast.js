// The tally that goes up when a node is done with: what came off it and what it taught
// them, one line an icon, over the landscape. It is the only place either is said — the
// card under the road is what was said about the work and nothing counted off it — so it
// hangs for as long as that card does rather than fading on a timer somebody might be
// reading past.
//
// Paper and ink, like the card, and hung off the same nine-slice: a tally is written out,
// not stamped in iron.

import { TUNING, COLORS, hex } from '../tuning.js';
import { framed, padOf, minOf, inkOf } from './frames.js';
import { iconKeyFor } from './icons.js';
import { nameOf } from './town.js';

const FRAME = 'plaque';
const DEPTH = 29200; // over the card, which is over the road

// One at a time. Two nodes cannot settle at once — the party has to walk to the next one —
// but a run turned back or a screen closed under a live toast would leave it hanging, so
// it is held here and cleared rather than left to its own timer.
let live = null;

export function clearToast() {
  live?.destroy();
  live = null;
}

// What a node handed over, and nothing else about it: what went on their backs, the
// experience, and anybody that took to a new level. Loot and what it taught them is the
// whole of what this panel is for — what it cost, what would not fit and what was left
// standing are the road's business, not the tally's.
//
// What went in the pack rather than what the node gave up: they are the same thing until
// the pack is full, and what will not go in is asked about where it happens.
function rowsOf(node) {
  const out = Object.entries(node.packed || node.spoils || {})
    .map(([m, n]) => ({ icon: iconKeyFor(m), label: nameOf(m), tail: `×${n}` }));
  if (node.xp) out.push({ label: 'Experience', tail: `+${node.xp} each`, colour: COLORS.menuAccent });
  for (const up of node.levelled || []) {
    out.push({ label: up.who, tail: `Level ${up.level}`, colour: COLORS.menuMapMark });
  }
  return out;
}

// Raised at the top corner of the road, clear of the column of skills down one side and
// the card standing on the foot of it. A node that paid nothing raises no tally: there is
// nothing to keep an account of, and the card says how it went either way.
export function rewardToast(scene, rect, node, night) {
  clearToast();
  const rows = rowsOf(node);
  if (!rows.length) return null;

  const pad = padOf(FRAME);
  const w = Math.max(TUNING.questToastWidth, minOf(FRAME).w);
  const head = TUNING.questBodySize + 6;
  const h = Math.max(minOf(FRAME).h, pad.t + head + rows.length * TUNING.questToastRow + pad.b);
  const x = rect.x + rect.w - w - TUNING.questToastInset;
  const y = rect.y + TUNING.questToastInset;

  const box = scene.add.container(0, 0).setDepth(DEPTH);
  for (const o of framed(scene, FRAME, { x, y, w, h }, night)) box.add(o);

  const write = (tx, ty, str, size, colour, right) => {
    const t = scene.add.text(tx, ty, str, {
      fontFamily: TUNING.font, fontSize: `${size}px`, color: hex(inkOf(FRAME, colour)),
    }).setOrigin(right ? 1 : 0, 0);
    box.add(t);
    return t;
  };

  write(x + pad.l, y + pad.t - 4, 'Taken', TUNING.questBodySize + 2, COLORS.menuText);

  // Each line fades in behind the one above it, so the tally reads as things being set
  // down one at a time rather than a block of text appearing.
  let ty = y + pad.t + head;
  rows.forEach((row, i) => {
    const parts = [];
    if (row.icon) {
      const icon = scene.add.image(x + pad.l + TUNING.questToastIcon / 2, ty + TUNING.questToastRow / 2 - 4,
        row.icon).setOrigin(0.5).setDisplaySize(TUNING.questToastIcon, TUNING.questToastIcon);
      box.add(icon);
      parts.push(icon);
    }
    parts.push(write(x + pad.l + TUNING.questToastIcon + 8, ty, row.label,
      TUNING.questBodySize, row.colour || COLORS.menuDim));
    parts.push(write(x + w - pad.r, ty, row.tail, TUNING.questBodySize, row.colour || COLORS.menuText, true));
    parts.forEach((o) => o.setAlpha(0));
    scene.tweens.add({
      targets: parts, alpha: 1, duration: TUNING.questToastFadeMs,
      delay: TUNING.questToastFadeMs + i * TUNING.questToastStepMs,
    });
    ty += TUNING.questToastRow;
  });

  // up from under the rail it is hung on, and left there: the card below says nothing
  // about what the node paid, so this stays up until the party walks on from it.
  box.setAlpha(0).setY(10);
  scene.tweens.add({ targets: box, alpha: 1, y: 0, duration: TUNING.questToastFadeMs, ease: 'Sine.out' });

  live = box;
  return box;
}
