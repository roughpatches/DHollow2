import { TUNING, COLORS, hex } from '../../tuning.js';
import * as craft from '../craft.js';
import {
  buildingOf, levelOf as stageAt, remaining, contribute, contributeLines, statusLines,
} from '../town.js';
import { engineFor, hintFor } from '../activity.js';
import { framed, padOf, inkOf } from '../frames.js';

const PANEL = 'parchment'; // a bench is stood at in the town, so it is the town's paper

// The workstation. Opens over World, which freezes behind it: everything the bench can
// ever make, what each one wants, and — where there is an engine for the work — the
// controls, handed over on the spot the way a node on the road hands them over.
//
// The stage above is the first row on the list rather than a second way of pressing [E] at
// the same place: standing at a bench, the two things you can do are work it and improve
// it, and they read better as one list than as two buildings.
export default class Craft extends Phaser.Scene {
  constructor() {
    super('Craft');
  }

  create() {
    const p = TUNING.questPad;
    this.box = { x: p, y: p, w: this.scale.width - p * 2, h: this.scale.height - p * 2 };
    const pad = padOf(PANEL);
    this.left = this.box.x + pad.l;
    this.wide = this.box.w - pad.l - pad.r;

    this.layer = this.add.container().setDepth(29500).setVisible(false);
    this.open_ = false;
    this.activity = null;
    this.making = null;
    this.done = null;

    this.input.keyboard.on('keydown', this.onKey, this);
    // a swing is a key held and let go, so the release wants its own listener
    this.input.keyboard.on('keyup', (ev) => {
      if (this.open_ && this.activity && ev.key === ' ') this.activity.strike();
    });
    this.game.events.on('craft:open', this.open, this);
  }

  open(id) {
    if (this.open_) return;
    this.at = id;
    this.row = 0;
    this.done = null;
    this.open_ = true;
    this.swallow = true; // the keypress that reached the bench must not also make something
    this.layer.setVisible(true);
    this.draw();
  }

  close() {
    this.open_ = false;
    this.layer.setVisible(false).setDepth(29500);
    this.activity = null;
    this.making = null;
    this.done = null;
    this.game.events.emit('craft:close');
  }

  update(time) {
    this.swallow = false;
    this.activity?.update(time);
  }

  // Rebuilt on every draw, because both halves of it move while the screen is open: a
  // stage paid off drops its row, and a recipe made spends what the next one wanted.
  rows() {
    const rows = craft.recipesAt(this.at).map((r) => ({ recipe: r }));
    return remaining(this.at) ? [{ repair: true }, ...rows] : rows;
  }

  onKey(ev) {
    if (!this.open_ || this.swallow) return;
    const k = ev.key.toLowerCase();

    // the engine has the controls while it is running, and nothing else does
    if (this.activity) {
      if (k === ' ') this.activity.chargeStart();
      else if (k === 'arrowleft' || k === 'a') this.activity.setSide('left');
      else if (k === 'arrowright' || k === 'd') this.activity.setSide('right');
      else if (k === 'arrowup' || k === 'w') this.activity.setSide('up');
      else if (k === 'arrowdown' || k === 's') this.activity.setSide('down');
      return;
    }

    if (this.done) {
      if (k === 'escape') this.close();
      else {
        this.done = null; // back to the bench, which has less on it than it had
        this.draw();
      }
      return;
    }

    if (k === 'escape') this.close();
    else if (k === 'arrowup' || k === 'w') this.step(-1);
    else if (k === 'arrowdown' || k === 's') this.step(1);
    // Space is the engines' key and nothing else: dismissing a tally with it must not also
    // spend the next lot of ingredients on another go.
    else if (k === 'enter' || k === 'e') this.begin();
  }

  step(dir) {
    const n = this.rows().length;
    if (n) this.row = (this.row + dir + n) % n;
    this.draw();
  }

  begin() {
    const entry = this.rows()[this.row];
    if (!entry) return;
    if (entry.repair) {
      this.rebuild();
      return;
    }
    // the controls where there is an engine for the work, and straight to the tally
    // where there is not
    const r = entry.recipe;
    if (!craft.canMake(r)) return;
    if (!craft.playedAt(r)) {
      this.finish(r, null);
      return;
    }
    this.making = r;
    // The panel goes under the engine's own drawing, with the bench written across the
    // top of it: an engine draws into the scene at its own depth and takes the screen.
    this.layer.setDepth(-100);
    this.draw();
    this.activity = engineFor(r.activity, this, {
      x: this.left + 40,
      top: this.box.y + 96,
      barW: Math.min(430, this.wide - 80),
    }, craft.optionsFor(r));
    this.activity.start((judgments) => {
      const failed = this.activity?.failed;
      this.activity = null;
      this.layer.setDepth(29500);
      this.finish(r, { judgments, failed });
    });
  }

  // Leave what you are carrying toward the stage above. The same hand-over the door of a
  // building takes, said at the bench because that is where you are standing.
  rebuild() {
    const result = contribute(this.at);
    if (result.levelled) this.game.events.emit('craft:built', this.at);
    this.done = { title: buildingOf(this.at).name, lines: contributeLines(this.at, result) };
    this.row = 0;
    this.draw();
  }

  finish(r, played) {
    const result = craft.make(r, played);
    this.making = null;
    this.done = result ? { title: r.name, lines: craft.madeLines(r, result) } : null;
    this.draw();
  }

  // --- drawing ---------------------------------------------------------------

  draw() {
    this.layer.removeAll(true);
    if (this.activity || this.making) {
      this.working();
      return;
    }
    this.panel();

    const b = buildingOf(this.at);
    const stage = b.stages[stageAt(this.at)];
    let y = this.box.y + TUNING.menuPad;
    y += this.text(this.left, y, b.name, TUNING.questTitleSize, COLORS.menuAccent).height + 6;
    y += this.text(this.left, y, `${stage.name}. ${stage.note}`,
      TUNING.questBodySize, COLORS.menuText, this.wide).height + 10;
    this.rule(y);
    y += 14;

    if (this.done) {
      this.tally(y);
      return;
    }

    const rows = this.rows();
    if (this.row >= rows.length) this.row = 0;
    if (!rows.length) {
      this.text(this.left, y, 'Nothing is made here yet.', TUNING.questBodySize, COLORS.menuDim);
      this.hint('[Esc] Away from the bench');
      return;
    }

    // Everything the bench could ever make, whether or not it can be made now: a row that
    // will not answer is what says which stage to rebuild and which level to reach.
    rows.forEach((entry, i) => {
      const on = i === this.row;
      const ready = this.readyAt(entry);
      const colour = on ? (ready ? COLORS.menuAccent : COLORS.menuMapFolk)
        : (ready ? COLORS.menuText : COLORS.menuDim);
      y += this.text(this.left, y, `${on ? '>' : ' '} ${ready ? '' : '· '}${this.labelOf(entry)}`,
        TUNING.questBodySize, colour).height + 6;
    });

    y += 8;
    this.rule(y);
    y += 14;
    for (const line of this.linesOf(rows[this.row])) {
      y += this.text(this.left, y, line, TUNING.questBodySize, COLORS.menuText, this.wide).height + 6;
    }
    this.hint(`[Up/Down] Look${this.readyAt(rows[this.row]) ? `    [Enter] ${rows[this.row].repair ? 'Leave what you carry' : 'Make it'}` : ''}`
      + '    [Esc] Away from the bench');
  }

  labelOf(entry) {
    if (!entry.repair) return entry.recipe.name;
    const b = buildingOf(this.at);
    return `Rebuild — ${b.stages[stageAt(this.at) + 1].name.toLowerCase()}`;
  }

  // A repair is ready when anything you are carrying is wanted; part-paying a stage is a
  // thing you are allowed to do, here as at the door.
  readyAt(entry) {
    if (!entry.repair) return craft.canMake(entry.recipe);
    return craft.canPay(this.at);
  }

  linesOf(entry) {
    if (entry.repair) return statusLines(this.at);
    return [...entry.recipe.body, ...craft.recipeLines(entry.recipe)];
  }

  // What came of it, in place of the list until a key is pressed.
  tally(y) {
    y += this.text(this.left, y, this.done.title, TUNING.questBodySize + 2, COLORS.menuAccent).height + 8;
    for (const line of this.done.lines) {
      y += this.text(this.left, y, line, TUNING.questBodySize, COLORS.menuText, this.wide).height + 6;
    }
    this.hint('[Any key] Back to the bench    [Esc] Away from it');
  }

  // While an engine has the screen: a ground for its readouts to be read against, and the
  // name of the work over the top of them. The engine draws everything else.
  working() {
    const g = this.add.graphics();
    g.fillStyle(COLORS.menuFill, 1); // the town behind it is not something to work by
    g.fillRect(0, 0, this.scale.width, this.scale.height);
    this.layer.add(g);
    const r = this.making;
    if (!r) return;
    this.text(this.left, this.box.y + 12, `${buildingOf(this.at).name} — ${r.name}`,
      TUNING.questBodySize + 2, COLORS.menuText);
    this.text(this.left, this.box.y + this.box.h - 26, hintFor(r.activity),
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

  hint(str) {
    this.text(this.left, this.box.y + this.box.h - 26, str, TUNING.questHintSize, COLORS.menuDim);
  }

  // Everything on the panel is written on paper; everything over an engine is written on
  // the dark it draws in. Nothing that builds a line has to know which.
  text(x, y, str, size, color, wrap) {
    const t = this.add.text(x, y, str, {
      fontFamily: TUNING.font,
      fontSize: `${size}px`,
      color: hex(this.activity || this.making ? color : inkOf(PANEL, color)),
      lineSpacing: 4,
      ...(wrap ? { wordWrap: { width: wrap } } : {}),
    });
    this.layer.add(t);
    return t;
  }
}
