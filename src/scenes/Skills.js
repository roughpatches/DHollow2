import { TUNING, COLORS, hex } from '../../tuning.js';
import { SKILLS, SKILL_GROUPS, GROUP_NAMES } from '../../content/skills.js';
import {
  setSkills, spendPoints, pointsOf, rankOf, worthOf, YOU,
} from '../party.js';
import { framed, padOf, inkOf } from '../frames.js';

const PANEL = 'parchment'; // the sheet is filled in at Aldis's table, which is in the town

// Choosing what your hands still know. Opens over whatever is behind it, which waits on
// it. Two things happen on this screen and they are the same arithmetic: the sheet filled
// in at the start — take three skills, spread the points across them — and every level
// after it, where the points a level handed over are put somewhere by hand.
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
    this.game.events.on('skills:spend', this.spendOpen, this);
  }

  open() {
    if (this.open_) return;
    this.mode = 'sheet';
    this.row = 0;
    this.taken = {}; // skill id against the points on it
    this.budget = TUNING.skillPointsAtLevelOne;
    this.open_ = true;
    this.swallow = true; // the keypress that closed the last line must not also pick
    this.layer.setVisible(true);
    this.draw();
  }

  // A level's points, spent. Nothing is committed until it is confirmed, so a point put
  // somewhere and taken back never left the bank — and closing without confirming leaves
  // the whole level's worth where it was.
  spendOpen(skillId) {
    if (this.open_ || !pointsOf(YOU)) return;
    this.mode = 'spend';
    this.row = Math.max(0, SKILLS.findIndex((t) => t.id === skillId));
    this.taken = {};
    this.budget = pointsOf(YOU);
    this.open_ = true;
    this.swallow = true;
    this.layer.setVisible(true);
    this.draw();
  }

  update() {
    this.swallow = false;
  }

  // what is left to spend, and whether the sheet is finished
  left_() {
    return this.budget - Object.values(this.taken).reduce((n, v) => n + v, 0);
  }

  count() {
    return Object.keys(this.taken).length;
  }

  done_() {
    if (this.mode === 'spend') return this.left_() < this.budget; // one point put somewhere
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
    else if (k === 'escape' && this.mode === 'spend') this.shut(); // nothing spent
    else if ((k === 'enter' || k === 'e') && this.done_()) {
      if (this.mode === 'spend') spendPoints(YOU, this.taken);
      else setSkills(YOU, this.taken);
      this.shut();
      return;
    }
    this.draw();
  }

  shut() {
    this.open_ = false;
    this.layer.setVisible(false);
    this.game.events.emit('skills:done');
  }

  // Taking a skill puts the first point on it; dropping it takes them all back. Spending a
  // level's points is the same key on a list where nothing is closed to you: a point can go
  // on work you have never done, which is the only way anybody ever starts.
  toggle(id) {
    if (this.taken[id] !== undefined) delete this.taken[id];
    else if (this.mode === 'spend') {
      if (this.left_() > 0) this.taken[id] = 1;
    } else if (this.count() < TUNING.skillsAtLevelOne && this.left_() > 0) this.taken[id] = 1;
    this.draw();
  }

  // a taken skill never goes below the point that took it
  spend(id, n) {
    if (this.taken[id] === undefined) {
      if (n > 0) this.toggle(id);
      return;
    }
    if (n > 0 && this.left_() <= 0) return;
    if (n < 0 && this.taken[id] <= 1) return;
    this.taken[id] += n;
  }

  draw() {
    this.layer.removeAll(true);
    this.panel();
    const spending = this.mode === 'spend';

    let y = this.box.y + TUNING.menuPad;
    y += this.text(this.left, y, spending ? 'What the last level was worth' : 'What your hands still know',
      TUNING.questTitleSize, COLORS.menuAccent).height + 6;
    y += this.text(this.left, y,
      spending
        ? `${this.budget} point${this.budget === 1 ? '' : 's'} to put anywhere on this list. Experience only ever buys these.`
        : `Take ${TUNING.skillsAtLevelOne}. Spread ${TUNING.skillPointsAtLevelOne} points between them.`,
      TUNING.questBodySize, COLORS.menuText).height + 4;

    const short = this.count() < TUNING.skillsAtLevelOne;
    y += this.text(this.left, y,
      spending
        ? (this.left_() ? `${this.left_()} unspent.` : 'All of it spent.')
        : (short
          ? `${TUNING.skillsAtLevelOne - this.count()} still to take, ${this.left_()} points unspent.`
          : (this.left_() ? `${this.left_()} points unspent.` : 'Settled.')),
      TUNING.questBodySize, this.done_() ? COLORS.menuAccent : COLORS.menuMapFolk).height + 10;
    this.rule(y);
    y += 14;

    // Sixteen skills in four groups, two groups to a column. The cursor runs the list in
    // the order it is written, so down off the foot of one column is the top of the next
    // — the same list, folded, rather than a grid with its own rules.
    const half = Math.ceil(SKILL_GROUPS.length / 2);
    const colW = this.wide / 2;
    const top = y;
    let column = top;
    SKILL_GROUPS.forEach((group, g) => {
      const x = this.left + (g < half ? 0 : colW);
      if (g === half) { column = y; y = top; } // over to the second column and back to the top
      y += this.text(x, y, GROUP_NAMES[group] || group,
        TUNING.questHintSize, COLORS.menuMapMark).height + 4;
      for (const t of SKILLS) {
        if (t.group !== group) continue;
        const i = SKILLS.indexOf(t);
        const on = i === this.row;
        // On the sheet a skill is taken or it is not; spending, a skill already has
        // whatever it has, and what is being decided is what goes on top of it.
        const put = this.taken[t.id];
        const rank = spending ? rankOf(YOU, t.id) + (put || 0) : put;
        const has = spending ? rank > 0 : put !== undefined;
        const moved = spending ? put !== undefined : has;
        const colour = moved ? COLORS.menuAccent : COLORS.menuText;
        y += this.text(x, y, `${on ? '>' : ' '} ${has ? `[${rank}]` : '[ ]'} ${t.name}`,
          TUNING.questBodySize, on ? colour : (moved ? COLORS.menuAccent : COLORS.menuDim)).height + 4;
      }
      y += 8;
    });
    y = Math.max(y, column);

    // What the skill under the cursor is for and what it would let you do, so the choice
    // is made on something. It is under the list rather than beside each row, because a
    // row in a column has no room beside it.
    const t = SKILLS[this.row];
    y += 4;
    this.rule(y);
    y += 14;
    const rank = spending ? rankOf(YOU, t.id) + (this.taken[t.id] || 0) : this.taken[t.id];
    const worth = t.activities.length
      ? `${t.activities.join(', ')}${rank ? ` — +${worthOf(rank)} to each` : ''}`
      : 'Rolled against a difficulty rather than played.';
    y += this.text(this.left, y, `${t.name} — ${worth}`,
      TUNING.questHintSize, COLORS.menuDim, this.wide).height + 8;
    for (const u of t.unlocks) {
      y += this.text(this.left, y, `— ${u}`, TUNING.questBodySize, COLORS.menuText, this.wide).height + 6;
    }

    this.text(this.left, this.box.y + this.box.h - 26,
      '[Up/Down] Look    [Space] Take or drop    [Left/Right] Move a point'
        + (this.done_() ? (spending ? '    [Enter] Settle it' : '    [Enter] That is who you are') : '')
        + (spending ? '    [Esc] Keep them for later' : ''),
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
