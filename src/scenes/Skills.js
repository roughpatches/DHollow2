import { TUNING, COLORS, hex } from '../../tuning.js';
import { SKILLS } from '../../content/skills.js';
import { setSkills, worthOf, YOU } from '../party.js';
import { framed, padOf, inkOf } from '../frames.js';

const PANEL = 'parchment'; // the sheet is filled in at Aldis's table, which is in the town

// Choosing what your hands still know. Opens over the hut scene, which waits on it:
// take three skills, spread the points across them, and that is the character sheet.
// The same arithmetic everyone else's sheet was written with, done in front of you.
export default class Skills extends Phaser.Scene {
  constructor() {
    super('Skills');
  }

  create() {
    const p = TUNING.questPad;
    this.box = { x: p, y: p, w: this.scale.width - p * 2, h: this.scale.height - p * 2 };
    const pad = padOf(PANEL);
    this.left = this.box.x + pad.l;
    this.wide = this.box.w - pad.l - pad.r;

    this.layer = this.add.container().setDepth(29500).setVisible(false);
    this.open_ = false;

    this.input.keyboard.on('keydown', this.onKey, this);
    this.game.events.on('skills:choose', this.open, this);
  }

  open() {
    if (this.open_) return;
    this.row = 0;
    this.taken = {}; // skill id against the points on it
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
    return TUNING.skillPointsAtLevelOne
      - Object.values(this.taken).reduce((n, v) => n + v, 0);
  }

  count() {
    return Object.keys(this.taken).length;
  }

  done_() {
    return this.count() === TUNING.skillsAtLevelOne && this.left_() === 0;
  }

  onKey(ev) {
    if (!this.open_ || this.swallow) return;
    const k = ev.key.toLowerCase();
    const t = SKILLS[this.row];

    if (k === 'arrowup' || k === 'w') this.row = (this.row - 1 + SKILLS.length) % SKILLS.length;
    else if (k === 'arrowdown' || k === 's') this.row = (this.row + 1) % SKILLS.length;
    else if (k === ' ') this.toggle(t.id);
    else if (k === 'arrowright' || k === 'd' || k === '=' || k === '+') this.spend(t.id, 1);
    else if (k === 'arrowleft' || k === 'a' || k === '-') this.spend(t.id, -1);
    else if ((k === 'enter' || k === 'e') && this.done_()) {
      setSkills(YOU, this.taken);
      this.open_ = false;
      this.layer.setVisible(false);
      this.game.events.emit('skills:done');
      return;
    }
    this.draw();
  }

  // taking a skill puts the first point on it; dropping it takes them all back
  toggle(id) {
    if (this.taken[id] !== undefined) delete this.taken[id];
    else if (this.count() < TUNING.skillsAtLevelOne && this.left_() > 0) this.taken[id] = 1;
    this.draw();
  }

  // a taken skill never goes below the point that took it
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
      `Take ${TUNING.skillsAtLevelOne}. Spread ${TUNING.skillPointsAtLevelOne} points between them.`,
      TUNING.questBodySize, COLORS.menuText).height + 4;

    const short = this.count() < TUNING.skillsAtLevelOne;
    y += this.text(this.left, y,
      short
        ? `${TUNING.skillsAtLevelOne - this.count()} still to take, ${this.left_()} points unspent.`
        : (this.left_() ? `${this.left_()} points unspent.` : 'Settled.'),
      TUNING.questBodySize, this.done_() ? COLORS.menuAccent : COLORS.menuMapFolk).height + 10;
    this.rule(y);
    y += 14;

    SKILLS.forEach((t, i) => {
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

    // what the skill under the cursor would let you do, so the choice is made on something
    y += 10;
    this.rule(y);
    y += 14;
    for (const u of SKILLS[this.row].unlocks) {
      y += this.text(this.left, y, `— ${u}`, TUNING.questBodySize, COLORS.menuText, this.wide).height + 6;
    }

    this.text(this.left, this.box.y + this.box.h - 26,
      '[Up/Down] Look    [Space] Take or drop    [Left/Right] Move a point'
        + (this.done_() ? '    [Enter] That is who you are' : ''),
      TUNING.questHintSize, COLORS.menuDim);
  }

  // --- bits ------------------------------------------------------------------

  panel() {
    for (const o of framed(this, PANEL, this.box)) this.layer.add(o);
  }

  rule(y) {
    const g = this.add.graphics();
    g.lineStyle(1, inkOf(PANEL, COLORS.menuRule), 1);
    g.lineBetween(this.left, y, this.left + this.wide, y);
    this.layer.add(g);
  }

  text(x, y, str, size, color, wrap) {
    const t = this.add.text(x, y, str, {
      fontFamily: TUNING.font,
      fontSize: `${size}px`,
      color: hex(inkOf(PANEL, color)),
      lineSpacing: 4,
      ...(wrap ? { wordWrap: { width: wrap } } : {}),
    });
    this.layer.add(t);
    return t;
  }
}
