// The tally that goes up when a node is done with: what came off it, one line an icon,
// over the landscape. It is the only place the account is kept — the card under the road
// says how the work went and nothing about what it paid — so it hangs for as long as that
// card does rather than fading on a timer somebody might be reading past.
//
// Paper and ink, like the card, and hung off the same nine-slice: a tally is written out,
// not stamped in iron.

import { TUNING, COLORS, hex } from '../tuning.js';
import { framed, padOf, minOf, inkOf } from './frames.js';
import { iconKeyFor } from './icons.js';
import { nameOf } from './town.js';
import { packLine, conLines, harvestLine, leftLines } from './run.js';
import { qualityPct } from './activity.js';

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

// What a node handed over, in the order it is worth reading: the things first, then what
// would not go in the pack, then the experience, then anybody it took to a new level.
// What went on their backs rather than what the node gave up — they are the same until
// the pack is full, and the day they are not is the day the difference matters.
function rowsOf(node) {
  const out = Object.entries(node.packed || node.spoils || {})
    .map(([m, n]) => ({ icon: iconKeyFor(m), label: nameOf(m), tail: `×${n}` }));
  for (const [m, n] of Object.entries(node.left || {})) {
    out.push({ icon: iconKeyFor(m), label: nameOf(m), tail: `×${n} left`, colour: COLORS.menuMapFolk });
  }
  if (node.xp) out.push({ label: 'Experience', tail: `+${node.xp} each`, colour: COLORS.menuAccent });
  for (const up of node.levelled || []) {
    out.push({ label: up.who, tail: `Level ${up.level}`, colour: COLORS.menuMapMark });
  }
  return out;
}

// The readouts under the rule: what the work was worth, what it did to the pool, how
// full they are, and what is still standing here. Sentences rather than columns, because
// none of them is a thing with a number beside it.
function footOf(node) {
  const out = [];
  const worth = harvestLine(node);
  if (worth) out.push({ str: worth, colour: COLORS.menuDim });
  const pct = qualityPct(node);
  if (pct) out.push({ str: pct, colour: COLORS.menuDim });
  const con = conLines(node);
  if (con) out.push({ str: con, colour: node.con >= 0 ? COLORS.menuMapMark : COLORS.menuMapFolk });
  const pack = packLine();
  if (pack) out.push({ str: pack, colour: COLORS.menuDim });
  for (const line of leftLines(node)) out.push({ str: line, colour: COLORS.menuMapFolk });
  return out;
}

// Raised at the top corner of the road, clear of the column of skills down one side and
// the card standing on the foot of it. A node that did nothing at all — took nothing,
// cost nothing — raises no tally, because there is nothing to keep an account of.
export function rewardToast(scene, rect, node, night) {
  clearToast();
  const rows = rowsOf(node);
  const foot = footOf(node);
  if (!rows.length && !foot.length) return null;

  const pad = padOf(FRAME);
  const w = Math.max(TUNING.questToastWidth, minOf(FRAME).w);
  const wrap = w - pad.l - pad.r;
  const head = TUNING.questBodySize + 6;

  const box = scene.add.container(0, 0).setDepth(DEPTH);

  const write = (tx, ty, str, size, colour, right, wide) => {
    const t = scene.add.text(tx, ty, str, {
      fontFamily: TUNING.font,
      fontSize: `${size}px`,
      color: hex(inkOf(FRAME, colour)),
      lineSpacing: 2,
      ...(wide ? { wordWrap: { width: wide } } : {}),
    }).setOrigin(right ? 1 : 0, 0);
    box.add(t);
    return t;
  };

  // The readouts are written before the frame is sized, because a sentence that wraps to
  // two lines makes the panel taller and there is no telling which ones will.
  const said = foot.map((f) => write(0, 0, f.str, TUNING.questHintSize, f.colour, false, wrap));
  const tall = said.reduce((n, t) => n + t.height + 4, 0);

  const h = Math.max(minOf(FRAME).h, pad.t + head + rows.length * TUNING.questToastRow
    + (tall ? tall + 10 : 0) + pad.b);
  const x = rect.x + rect.w - w - TUNING.questToastInset;
  const y = rect.y + TUNING.questToastInset;

  for (const o of framed(scene, FRAME, { x, y, w, h }, night)) box.add(o);
  for (const t of said) box.bringToTop(t); // measured before the frame was hung

  write(x + pad.l, y + pad.t - 4, rows.length ? 'Taken' : 'Nothing taken',
    TUNING.questBodySize + 2, COLORS.menuText);

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

  // and the readouts under a rule, in the small type: the same order the card used to
  // read them in, and landing after the last thing has been set down
  if (said.length) {
    const g = scene.add.graphics();
    g.lineStyle(1, inkOf(FRAME, COLORS.menuRule), 1);
    g.lineBetween(x + pad.l, ty + 4, x + w - pad.r, ty + 4);
    box.add(g);
    ty += 10;
    const late = TUNING.questToastFadeMs + rows.length * TUNING.questToastStepMs;
    g.setAlpha(0);
    scene.tweens.add({ targets: g, alpha: 1, duration: TUNING.questToastFadeMs, delay: late });
    for (const t of said) {
      t.setPosition(x + pad.l, ty).setAlpha(0);
      scene.tweens.add({ targets: t, alpha: 1, duration: TUNING.questToastFadeMs, delay: late });
      ty += t.height + 4;
    }
  }

  // up from under the rail it is hung on, and left there: the card below says nothing
  // about what the node paid, so this stays up until the party walks on from it.
  box.setAlpha(0).setY(10);
  scene.tweens.add({ targets: box, alpha: 1, y: 0, duration: TUNING.questToastFadeMs, ease: 'Sine.out' });

  live = box;
  return box;
}
