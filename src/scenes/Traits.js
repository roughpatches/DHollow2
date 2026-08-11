import { TUNING, COLORS, hex } from '../../tuning.js';
import { TRAITS } from '../../content/traits.js';
import { setTraits, worthOf, YOU } from '../party.js';

// Choosing what your hands still know. Opens over the hut scene, which waits on it:
// take three traits, spread the points across them, and that is the character sheet.
// The same arithmetic everyone else's sheet was written with, done in front of you.
export default class Traits extends Phaser.Scene {
  constructor() {
    super('Traits');
  }

  create() {
    const p = TUNING.questPad;
    this.box = { x: p, y: p, w: this.scale.width - p * 2, h: this.scale.height - p * 2 };
    this.left = this.box.x + TUNING.menuPad;
    this.wide = this.box.w - TUNING.menuPad * 2;

    this.layer = this.add.container().setDepth(29500).setVisible(false);
    this.open_ = false;

    this.input.keyboard.on('keydown', this.onKey, this);
    this.game.events.on('traits:choose', this.open, this);
  }

  open() {
    if (this.open_) return;
    this.row = 0;
    this.taken = {}; // trait id against the points on it
    this.open_ = true;
    this.swallow = true; // the keypress that closed the last line must not also pick
    this.layer.setVisible(true);
    this.draw();
  }

  update() {
    this.swallow = false;
  }

  // what is left to spend, and whether the sheet is finished
  left_() {
    return TUNING.traitPointsAtLevelOne
      - Object.values(this.taken).reduce((n, v) => n + v, 0);
  }

  count() {
    return Object.keys(this.taken).length;
  }

  done_() {
    return this.count() === TUNING.traitsAtLevelOne && this.left_() === 0;
  }

  onKey(ev) {
    if (!this.open_ || this.swallow) return;
    const k = ev.key.toLowerCase();
    const t = TRAITS[this.row];

    if (k === 'arrowup' || k === 'w') this.row = (this.row - 1 + TRAITS.length) % TRAITS.length;
    else if (k === 'arrowdown' || k === 's') this.row = (this.row + 1) % TRAITS.length;
    else if (k === ' ') this.toggle(t.id);
    else if (k === 'arrowright' || k === 'd' || k === '=' || k === '+') this.spend(t.id, 1);
    else if (k === 'arrowleft' || k === 'a' || k === '-') this.spend(t.id, -1);
    else if ((k === 'enter' || k === 'e') && this.done_()) {
      setTraits(YOU, this.taken);
      this.open_ = false;
      this.layer.setVisible(false);
      this.game.events.emit('traits:done');
      return;
    }
    this.draw();
  }

  // taking a trait puts the first point on it; dropping it takes them all back
  toggle(id) {
    if (this.taken[id] !== undefined) delete this.taken[id];
    else if (this.count() < TUNING.traitsAtLevelOne && this.left_() > 0) this.taken[id] = 1;
    this.draw();
  }

  // a taken trait never goes below the point that took it
  spend(id, n) {
    if (this.taken[id] === undefined) return;
    if (n > 0 && this.left_() <= 0) return;
    if (n < 0 && this.taken[id] <= 1) return;
    this.taken[id] += n;
  }

  draw() {
    this.layer.removeAll(true);
    this.panel();

    let y = this.box.y + TUNING.menuPad;
    y += this.text(this.left, y, 'What your hands still know', TUNING.questTitleSize, COLORS.menuAccent).height + 6;
    y += this.text(this.left, y,
      `Take ${TUNING.traitsAtLevelOne}. Spread ${TUNING.traitPointsAtLevelOne} points between them.`,
      TUNING.questBodySize, COLORS.menuText).height + 4;

    const short = this.count() < TUNING.traitsAtLevelOne;
    y += this.text(this.left, y,
      short
        ? `${TUNING.traitsAtLevelOne - this.count()} still to take, ${this.left_()} points unspent.`
        : (this.left_() ? `${this.left_()} points unspent.` : 'Settled.'),
      TUNING.questBodySize, this.done_() ? COLORS.menuAccent : COLORS.menuMapFolk).height + 10;
    this.rule(y);
    y += 14;

    TRAITS.forEach((t, i) => {
      const on = i === this.row;
      const rank = this.taken[t.id];
      const has = rank !== undefined;
      const mark = has ? `[${rank}]` : '[ ]';
      const colour = has ? COLORS.menuAccent : COLORS.menuText;
      this.text(this.left + this.wide, y + 2,
        has ? `+${worthOf(rank)} to ${t.activities.join(', ')}` : t.activities.join(', '),
        TUNING.questHintSize, on ? COLORS.menuDim : COLORS.menuRule).setOrigin(1, 0);
      y += this.text(this.left, y, `${on ? '>' : ' '} ${mark} ${t.name}`,
        TUNING.questBodySize, on ? colour : (has ? COLORS.menuAccent : COLORS.menuDim)).height + 6;
    });

    // what the trait under the cursor would let you do, so the choice is made on something
    y += 10;
    this.rule(y);
    y += 14;
    for (const u of TRAITS[this.row].unlocks) {
      y += this.text(this.left, y, `— ${u}`, TUNING.questBodySize, COLORS.menuText, this.wide).height + 6;
    }

    this.text(this.left, this.box.y + this.box.h - 26,
      '[Up/Down] Look    [Space] Take or drop    [Left/Right] Move a point'
        + (this.done_() ? '    [Enter] That is who you are' : ''),
      TUNING.questHintSize, COLORS.menuDim);
  }

  // --- bits ------------------------------------------------------------------

  panel() {
    const b = this.box;
    const g = this.add.graphics();
    g.fillStyle(COLORS.menuFill, 0.98);
    g.fillRect(b.x, b.y, b.w, b.h);
    g.lineStyle(2, COLORS.menuEdge, 1);
    g.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
    this.layer.add(g);
  }

  rule(y) {
    const g = this.add.graphics();
    g.lineStyle(1, COLORS.menuRule, 1);
    g.lineBetween(this.left, y, this.left + this.wide, y);
    this.layer.add(g);
  }

  text(x, y, str, size, color, wrap) {
    const t = this.add.text(x, y, str, {
      fontFamily: 'monospace',
      fontSize: `${size}px`,
      color: hex(color),
      lineSpacing: 4,
      ...(wrap ? { wordWrap: { width: wrap } } : {}),
    });
    this.layer.add(t);
    return t;
  }
}
