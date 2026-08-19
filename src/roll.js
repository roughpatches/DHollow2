// The die, thrown where the party can see it. A check is settled in src/party.js the
// moment a node resolves — this is that number being watched as it lands, and nothing
// here decides anything.
//
// Three things in the one panel: the dial on the left, spinning through the faces of a
// d20 and slowing onto the one that was rolled; what the party brought to it coming in
// after, a line at a time; and on the right, how hard the thing was — the band it falls
// in and not the DC, because a party knows a hard climb when it sees one and does not
// know the number behind it.
//
// Iron, not paper: the card under the road is the account, and this is the throw.

import { TUNING, COLORS, hex } from '../tuning.js';
import { framed, padOf, minOf } from './frames.js';

const FRAME = 'band'; // the road's own ironwork, so the die is stamped rather than written
const PLATE = 'plate'; // and the square the face turns up in
const DEPTH = 29300; // over the tally, which is over the card

// One at a time, held here for the same reason the tally is: a screen closed or a page
// turned under a live throw would leave it hanging over whatever came next.
let live = null;

export function clearRoll() {
  live?.destroy();
  live = null;
}

// How hard it was, in words. The last band takes everything above it, so a DC nobody has
// written yet still lands somewhere.
function bandFor(dc) {
  return TUNING.checkBands.find((b) => dc <= b.upTo) || TUNING.checkBands.at(-1);
}

// What the party put behind the die, in the order it is added: what they know, and then
// whatever is working on them. A roll with nothing behind it shows nothing — an empty
// row of chips is a row saying the party is on their own, and the total says that.
function bonusesOf(check) {
  const out = [];
  if (check.rank) out.push({ label: check.skill.name, n: check.rank });
  if (check.steady) out.push({ label: 'Steady', n: check.steady });
  return out;
}

// A face that is not the one showing, so a spin never stutters on the same number twice.
function otherFace(showing) {
  let face = showing;
  while (face === showing) face = 1 + Math.floor(Math.random() * TUNING.checkDie);
  return face;
}

// Thrown at the near corner of the road, opposite the tally: the two never overlap, and
// one of them is what the party is about to find out and the other is what it got them.
export function rollCard(scene, rect, check, night) {
  clearRoll();

  const pad = padOf(FRAME);
  const dial = TUNING.questRollDial;
  const w = Math.max(TUNING.questRollWidth, minOf(FRAME).w);
  const wrap = w - pad.l - pad.r;
  const band = bandFor(check.dc);
  const bonuses = bonusesOf(check);

  // Written before the panel is sized, because how tall it is is how many rows of these
  // there turned out to be — the same order the card under the road is built in.
  const write = (str, size, colour) => scene.add.text(0, 0, str, {
    fontFamily: TUNING.font, fontSize: `${size}px`, color: hex(colour),
  });
  // The face is the one thing here written on paper rather than on iron — the dial is a
  // parchment square — so it is written in ink, like anything else that lands on a page.
  const face = write(String(otherFace(check.die)), TUNING.questRollFaceSize, COLORS.inkText)
    .setOrigin(0.5);
  const named = write(check.skill.name, TUNING.questHintSize, COLORS.menuDim);
  const how = write(band.name, TUNING.questRollBandSize, band.colour);
  const chips = bonuses.map((b) => write(`+${b.n} ${b.label}`, TUNING.questBodySize, COLORS.menuAccent));
  const sum = write(`= ${check.total}`, TUNING.questBodySize + 2, COLORS.menuText);
  const said = write(check.pass ? 'Held.' : 'Lost.', TUNING.questBodySize + 2,
    check.pass ? COLORS.menuMapMark : COLORS.menuMapFolk);

  // The chips run left to right under the dial and wrap when the panel runs out, so a
  // party carrying more than the two things there are today still fits inside its frame.
  const rows = [[]];
  let used = 0;
  for (const chip of chips) {
    if (used && used + chip.width > wrap) { rows.push([]); used = 0; }
    rows.at(-1).push([chip, used]);
    used += chip.width + TUNING.questRollChipGap;
  }
  const chipRows = chips.length ? rows.length : 0;

  const head = Math.max(dial, named.height + how.height + 4);
  // The sum is the tallest line on the panel and the last one, so the frame is built to
  // the height it actually came out rather than to a row's worth: a line measured short
  // is a line written on the bottom rail.
  const tail = Math.max(sum.height, said.height) + 6;
  const h = Math.max(minOf(FRAME).h,
    pad.t + head + 4 + chipRows * TUNING.questRollRow + tail + pad.b);
  const x = rect.x + TUNING.questRollInset;
  const y = rect.y + TUNING.questRollInset;

  const box = scene.add.container(0, 0).setDepth(DEPTH);
  for (const o of framed(scene, FRAME, { x, y, w, h }, night)) box.add(o);

  // the dial itself: a square off the same plate a walked node is hung in, with the face
  // turning over inside it
  const dx = x + pad.l;
  const dy = y + pad.t;
  for (const o of framed(scene, PLATE, { x: dx, y: dy, w: dial, h: dial }, night)) box.add(o);
  face.setPosition(dx + dial / 2, dy + dial / 2);
  box.add(face);

  named.setPosition(dx + dial + 14, dy + 2);
  how.setPosition(dx + dial + 14, dy + 2 + named.height + 4);
  box.add(named);
  box.add(how);

  let ty = y + pad.t + head + 4;
  rows.forEach((row) => {
    for (const [chip, at] of row) chip.setPosition(dx + at, ty);
    if (row.length) ty += TUNING.questRollRow;
  });
  for (const chip of chips) box.add(chip);
  sum.setPosition(dx, ty);
  said.setPosition(dx + sum.width + 12, ty);
  box.add(sum);
  box.add(said);

  // Nothing behind the dial is showing yet: the panel comes up with a face turning over
  // in it and fills in from there.
  for (const o of [...chips, sum, said]) o.setAlpha(0);
  how.setAlpha(0);
  box.setAlpha(0);
  scene.tweens.add({ targets: box, alpha: 1, duration: TUNING.questToastFadeMs, ease: 'Sine.out' });

  // The spin: faces close together at the start and further apart towards the end, which
  // is a die slowing rather than a number changing a fixed number of times.
  const ticks = TUNING.questRollTicks;
  const spin = TUNING.questRollSpinMs;
  for (let i = 1; i <= ticks; i++) {
    const t = i / ticks;
    scene.time.delayedCall(spin * (1 - (1 - t) * (1 - t)), () => {
      if (live !== box) return;
      face.setText(String(i === ticks ? check.die : otherFace(Number(face.text))));
      if (i !== ticks) return;
      // A top face holds whatever was asked and a 1 never does, so both are said in their
      // own colour: the two throws where the DC stopped mattering.
      if (check.die === TUNING.checkDie) face.setColor(hex(COLORS.inkAccent));
      else if (check.die === 1) face.setColor(hex(COLORS.inkFolk));
      scene.tweens.add({
        targets: face, scale: TUNING.questRollLandScale, duration: 90, yoyo: true, ease: 'Quad.out',
      });
      scene.tweens.add({ targets: how, alpha: 1, duration: TUNING.questToastFadeMs });
    });
  }

  // and then what the party brought, one line at a time, and the sum of it last
  const after = spin + TUNING.questRollPauseMs;
  chips.forEach((chip, i) => {
    scene.tweens.add({
      targets: chip, alpha: 1, duration: TUNING.questToastFadeMs,
      delay: after + i * TUNING.questRollStepMs,
    });
  });
  scene.tweens.add({
    targets: [sum, said], alpha: 1, duration: TUNING.questToastFadeMs,
    delay: after + chips.length * TUNING.questRollStepMs,
  });

  const done = after + (chips.length + 1) * TUNING.questRollStepMs;
  scene.time.delayedCall(done + TUNING.questRollHoldMs, () => {
    if (live !== box) return;
    scene.tweens.add({
      targets: box, alpha: 0, duration: TUNING.questToastFadeMs,
      onComplete: () => { if (live === box) live = null; box.destroy(); },
    });
  });

  live = box;
  return box;
}
