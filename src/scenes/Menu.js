import { TUNING, COLORS, hex } from '../../tuning.js';
import { MAPS } from '../../content/maps.js';
import { NPCS } from '../../content/npcs.js';
import { CHARACTER, INVENTORY, COMPANIONS } from '../../content/character.js';
import { BESTIARY, QUESTS } from '../../content/codex.js';
import { PLACES } from '../../content/places.js';
import { SETTINGS } from '../../content/settings.js';
import { option, setting, cycleSetting, applyToWorld } from '../settings.js';
import { SCRIPT } from '../placeholders.js';
import { skillRows, fill, pointsOf, YOU } from '../party.js';
import { statusLines, carriedRows, buildings } from '../town.js';
import { iconKeyFor } from '../icons.js';
import { drawSlots, shapeOf } from '../slots.js';
import { cutRows } from '../charm.js';
import { gearRows } from '../gear.js';
import * as potions from '../potions.js';
import { questRows, placeLines, canStart, blockers } from '../run.js';
import { framed, padOf, inkOf } from '../frames.js';

const PANEL = 'parchment'; // the menu is opened standing in the town, so it is the town's paper
const PLATE = 'plate'; // and a picture on it is set in the square off the same sheet

// Gregorious's jobs carry live run state, so they are rebuilt on every draw and sit
// above the log of everything else the village has told you it wants.
const questLog = () => [...questRows(), ...QUESTS];

// What is in the town's stock, and above it the cut stones. Mostly a readout: what goes
// out on a run and which stone goes on the cord are decided at the gate, on the packing
// screen in src/scenes/Quest.js, because they are decisions about a job rather than about
// a shelf. The one exception is a potion, which is drunk where it is standing.
//
// One row per SQUARE rather than per thing: a stack past stackMax is more than one square
// and is listed as more than one, so the cursor walks what is drawn. Every square of a
// stack points at the same entry, so the detail pane reads the same either way.
const squares = (entry, n) => {
  const out = [];
  for (let left = n; left > 0; left -= TUNING.stackMax) {
    out.push({ ...entry, n: Math.min(left, TUNING.stackMax), note: `${Math.min(left, TUNING.stackMax)}` });
  }
  return out;
};

// A potion is the one square on the tab that does something: Enter drinks it, and drunk
// in town it takes the next job out rather than this afternoon. Once it is drunk the
// bottle is gone from the pack, so what is waiting is listed after it — otherwise the
// square would simply vanish and the player would be told nothing.
const withPotion = (r) => (potions.isPotion(r.mid) ? {
  ...r,
  body: [
    ...r.body,
    ...potions.linesFor(r.mid),
    potions.taken(r.mid)
      ? 'One of these is already working. A second would do nothing.'
      : 'Drink it here and it takes the next job out. [Enter]',
  ],
} : r);

const inventory = () => [
  // Gear above the stones and the stones above the pack, which is the order they are
  // decided in at the gate: what is on the body, what is on the cord, what is carried.
  ...gearRows().flatMap((r) => squares(r, r.n ?? 1)),
  ...cutRows().flatMap((r) => squares(r, r.n ?? 1)),
  ...carriedRows().map(withPotion).flatMap((r) => squares(r, r.n)),
  ...potions.waitingRows().map((p) => ({
    label: p.name,
    note: 'Drunk',
    icon: p.mid,
    body: ['Drunk here, and waiting on the next job out.', ...p.body],
  })),
  ...INVENTORY,
];

// The Map tab is where the party can go, not everywhere they have stood: a place with an
// id is a zone a job is walked in, and everything else in content/places.js is town
// scenery the tab used to list. Drop the filter to have them all back.
const locations = () => PLACES.filter((p) => p.id);

// Runs alongside World, hidden until M. Every tab is the same list-and-detail view
// over the same {label, note, body} shape, so adding a tab is one line here and one
// array in content/. An entry carrying a `map` also gets that grid drawn above its
// text — the one thing a list of paragraphs cannot say — and one carrying `options`
// becomes a setting the player cycles with Enter. Script is the one derived tab: it is
// scanned out of the others rather than written, and lists every line still unwritten.
// A tab's rows are an array, or a function returning one when the rows change while
// the game runs — Party's level and HP move, so it is rebuilt on every draw.
// A tab marked 'grid' draws its rows as squares of icons instead of a column of names;
// everything else about it — cursor, scrolling, detail pane — is the same.
const TABS = [
  ['Character', CHARACTER],
  ['Skills', skillRows],
  ['Companions', COMPANIONS],
  ['Inventory', inventory, 'grid'],
  ['Bestiary', BESTIARY],
  // one word each: the strip gives up its spacing before it gives up a name, and
  // 'Quest Log' read as two tabs
  ['Quests', questLog],
  ['Map', locations],
  ['Script', SCRIPT],
  ['Settings', SETTINGS],
];

// a setting's right-hand column is whichever option it is currently on. {playerName}
// resolves here as well as in dialogue, so the sheet can carry a name nobody wrote.
function noteOf(entry) {
  return fill(entry.options ? option(entry.id).name : entry.note || '');
}

const EMPTY = { label: '—', note: '', body: ['Nothing recorded yet.'] };

export default class Menu extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const m = TUNING.menuMargin;
    const p = TUNING.menuPad;
    this.box = { x: m, y: m, w: this.scale.width - m * 2, h: this.scale.height - m * 2 };
    this.listX = this.box.x + p;
    this.detailX = this.listX + TUNING.menuListWidth + p;
    this.detailW = this.box.x + this.box.w - p - this.detailX;
    this.bodyY = this.box.y + TUNING.menuTabStripHeight + p;

    // each tab keeps its own cursor, so tabbing away and back lands where you left
    this.tab = 0;
    this.row = TABS.map(() => 0);
    this.top = TABS.map(() => 0);

    this.layer = this.add.container().setDepth(30000).setVisible(false);
    this.open_ = false;

    this.input.keyboard.on('keydown', this.onKey, this);
  }

  onKey(ev) {
    const k = ev.key.toLowerCase();

    if (k === 'm') {
      this.toggle();
      return;
    }
    if (!this.open_) return;

    if (k === 'escape') this.close();
    else if (k === 'arrowleft' || k === 'a') this.step('tab', -1);
    else if (k === 'arrowright' || k === 'd') this.step('tab', 1);
    else if (k === 'arrowup' || k === 'w') this.step('row', -1);
    else if (k === 'arrowdown' || k === 's') this.step('row', 1);
    else if (k === 'enter' || k === ' ') this.change();
  }

  // left and right already belong to the tab strip, so a setting cycles forward on
  // Enter rather than being nudged along an axis
  change() {
    const entry = this.rows()[this.row[this.tab]];
    if (!entry) return;
    // somewhere you set out for, rather than something you cycle
    if (entry.quest) {
      if (!canStart(entry.quest)) return;
      this.close();
      this.game.events.emit('quest:start', entry.quest);
      return;
    }
    // a level's points, put on the skill under the cursor. The sheet opens over the town
    // with the menu shut behind it, the way it did the first time it was filled in.
    if (entry.skill) {
      if (!pointsOf(YOU)) return;
      this.close();
      this.game.events.emit('skills:spend', entry.skill);
      return;
    }
    // a bottle, and the only square on the Inventory tab that answers to Enter
    if (entry.mid && potions.canDrink(entry.mid)) {
      potions.drink(entry.mid);
      this.draw();
      return;
    }
    if (!entry.options) return;
    cycleSetting(entry.id);
    applyToWorld(this.scene.get('World'));
    this.draw();
  }

  toggle() {
    if (this.open_) {
      this.close();
      return;
    }
    // World is frozen during dialogue and door transitions; the menu does not
    // interrupt either, and would have nothing to unfreeze on the way out
    if (this.scene.get('World').frozen) return;
    this.open_ = true;
    this.layer.setVisible(true);
    this.draw();
    this.game.events.emit('menu:open');
  }

  close() {
    this.open_ = false;
    this.layer.setVisible(false);
    this.game.events.emit('menu:close');
  }

  step(what, dir) {
    if (what === 'tab') {
      this.tab = (this.tab + dir + TABS.length) % TABS.length;
    } else {
      const n = this.rows().length;
      if (n) this.row[this.tab] = (this.row[this.tab] + dir + n) % n;
    }
    this.draw();
  }

  rows() {
    const r = TABS[this.tab][1];
    return typeof r === 'function' ? r() : r;
  }

  draw() {
    this.layer.removeAll(true);
    this.panel();
    this.tabStrip();
    if (TABS[this.tab][2] === 'grid') this.grid();
    else this.list();
    this.detail();
    this.hint();
  }

  // --- pieces -------------------------------------------------------------

  panel() {
    const b = this.box;
    for (const o of framed(this, PANEL, b)) this.layer.add(o);
    const g = this.add.graphics();
    g.fillStyle(this.ink(COLORS.menuPanel), 1);
    g.fillRect(this.listX - 8, this.bodyY - 10, TUNING.menuListWidth + 8, b.y + b.h - this.bodyY - 34);
    const pad = padOf(PANEL);
    g.lineStyle(1, this.ink(COLORS.menuRule), 1);
    g.lineBetween(b.x + pad.l, b.y + TUNING.menuTabStripHeight,
      b.x + b.w - pad.r, b.y + TUNING.menuTabStripHeight);
    this.layer.add(g);
  }

  // Laid out twice: once to measure, once to place. The strip gives up its spacing
  // before it gives up a tab name, so adding a tab crowds the row rather than
  // pushing the last one off the end of the panel.
  tabStrip() {
    const y = this.box.y + 12;
    const texts = TABS.map(([name], i) =>
      this.text(0, y, name, TUNING.menuTabSize, i === this.tab ? COLORS.menuAccent : COLORS.menuDim));

    const room = this.box.x + this.box.w - TUNING.menuPad - this.listX;
    const used = texts.reduce((w, t) => w + t.width, 0);
    const gap = Math.max(6, Math.min(TUNING.menuTabGap, (room - used) / Math.max(1, TABS.length - 1)));

    let x = this.listX;
    texts.forEach((t, i) => {
      t.setX(x);
      if (i === this.tab) {
        const g = this.add.graphics();
        g.fillStyle(this.ink(COLORS.menuAccent), 1);
        g.fillRect(x, y + t.height + 3, t.width, 2);
        this.layer.add(g);
      }
      x += t.width + gap;
    });
  }

  list() {
    const rows = this.rows();
    const sel = this.row[this.tab];
    const h = TUNING.menuRowHeight;
    const visible = TUNING.menuRowsVisible;

    // scroll only as far as it takes to bring the cursor back into view
    let top = this.top[this.tab];
    if (sel < top) top = sel;
    if (sel >= top + visible) top = sel - visible + 1;
    top = Math.max(0, Math.min(top, Math.max(0, rows.length - visible)));
    this.top[this.tab] = top;

    for (let i = top; i < Math.min(rows.length, top + visible); i++) {
      const y = this.bodyY + (i - top) * h;
      const on = i === sel;

      if (on) {
        const g = this.add.graphics();
        g.fillStyle(this.ink(COLORS.menuSelectFill), 1);
        g.fillRect(this.listX - 8, y - 3, TUNING.menuListWidth + 8, h);
        g.fillStyle(this.ink(COLORS.menuAccent), 1);
        g.fillRect(this.listX - 8, y - 3, 2, h);
        this.layer.add(g);
      }

      const note = this.text(
        this.listX + TUNING.menuListWidth - 12,
        y,
        noteOf(rows[i]),
        TUNING.menuRowSize,
        on ? COLORS.menuAccent : COLORS.menuRule,
      ).setOrigin(1, 0);

      const label = this.text(
        this.listX + 4,
        y,
        rows[i].label,
        TUNING.menuRowSize,
        on ? COLORS.menuText : COLORS.menuDim,
      );
      // the note is the thing you scan the column for, so a long label loses its tail
      // rather than being written over the top of it
      const room = TUNING.menuListWidth - 28 - note.width;
      while (label.width > room && label.text.length > 2) {
        label.setText(`${label.text.slice(0, -2)}…`);
      }
    }

    if (rows.length > visible) {
      this.text(
        this.listX + 4,
        this.bodyY + visible * h + 6,
        `${sel + 1} / ${rows.length}`,
        TUNING.menuHintSize,
        COLORS.menuDim,
      );
    }
  }

  // The same rows and the same cursor as a list tab, laid out as squares. Up and down
  // step one square in reading order rather than a whole line, because left and right
  // belong to the tab strip and a grid has no third axis to give them.
  // The grid is padded out to a full rectangle with empty squares: how much is in a pack
  // is read off how much of it is not, so a ragged last row would be saying the wrong
  // thing even here, where the town's shelves have no bottom.
  grid() {
    const rows = this.rows();
    const sel = this.row[this.tab];
    const cell = TUNING.menuIconCell;
    const at = { x: this.listX - 8, y: this.bodyY - 10, w: TUNING.menuListWidth };
    const { cols } = shapeOf(at.w, rows.length, cell);
    const lines = Math.max(1, Math.floor((this.box.y + this.box.h - 64 - at.y) / cell));
    const visible = cols * lines;

    // scroll a whole line at a time, and only far enough to bring the cursor back
    let top = this.top[this.tab];
    if (sel < top) top = sel - (sel % cols);
    if (sel >= top + visible) top = sel - (sel % cols) - visible + cols;
    top = Math.max(0, Math.min(top, Math.max(0, (Math.ceil(rows.length / cols) - lines) * cols)));
    this.top[this.tab] = top;

    const page = rows.slice(top, top + visible)
      .map((r) => ({ id: r.icon, n: r.n, note: noteOf(r) }));
    while (page.length < visible) page.push(null);

    drawSlots(this, {
      at,
      cell,
      cells: page,
      sel: sel - top,
      ink: (c) => this.ink(c),
      add: (o) => this.layer.add(o),
      text: (x, y, str, size, colour) => this.text(x, y, str, size, colour),
    });

    if (rows.length > visible) {
      this.text(at.x + 12, at.y + lines * cell + 4, `${sel + 1} / ${rows.length}`,
        TUNING.menuHintSize, COLORS.menuDim);
    }
  }

  detail() {
    const entry = this.rows()[this.row[this.tab]] || EMPTY;
    let y = this.bodyY - 6;

    y += this.text(this.detailX, y, entry.label, TUNING.menuTitleSize, COLORS.menuAccent).height + 4;
    const note = noteOf(entry);
    if (note) {
      y += this.text(this.detailX, y, note, TUNING.menuRowSize, COLORS.menuDim).height + 6;
    }

    const g = this.add.graphics();
    g.lineStyle(1, this.ink(COLORS.menuRule), 1);
    g.lineBetween(this.detailX, y + 4, this.detailX + this.detailW, y + 4);
    this.layer.add(g);
    y += 18;

    // A zone is a painting and what is in it rather than a page of prose: what it looks
    // like to stand in, what is said about it, and along the bottom what it is made of
    // and what comes off it.
    if (entry.backdrop) return this.location(entry, y);

    // a building's state is read live rather than written into the entry, so repairing
    // it in the world changes what this page says about it
    let body = entry.body;
    if (entry.building) body = [...statusLines(entry.building), ...entry.body];
    if (entry.quest) body = [...placeLines(entry.quest), ...entry.body];

    // the prose is measured first and the map takes whatever vertical room is left over,
    // so a long entry shrinks its map rather than running off the bottom of the panel
    const paras = body.map((p) =>
      this.text(this.detailX, 0, fill(p), TUNING.menuBodySize, COLORS.menuText, this.detailW));
    const proseH = paras.reduce((h, t) => h + t.height + 14, 0);

    if (entry.map) y = this.miniMap(entry, y) + 16;
    if (entry.options) y = this.choices(entry, y) + 20;

    for (const t of paras) {
      t.setY(y);
      y += t.height + 14;
    }
  }

  // Every option laid out at once, current one boxed, so the whole range of a setting
  // is visible without cycling through it to find out what is there.
  choices(entry, y) {
    const current = option(entry.id);
    const g = this.add.graphics();
    this.layer.add(g);

    let x = this.detailX;
    let bottom = y;
    for (const o of entry.options) {
      const on = o === current;
      const t = this.text(x + 8, y + 4, o.name, TUNING.menuRowSize, on ? COLORS.menuText : COLORS.menuDim);
      g.lineStyle(1, this.ink(on ? COLORS.menuAccent : COLORS.menuRule), 1);
      g.strokeRect(x, y, t.width + 16, t.height + 8);
      x += t.width + 16 + 10;
      bottom = y + t.height + 8;
    }
    return bottom;
  }

  hang(name, rect) {
    for (const o of framed(this, name, rect)) this.layer.add(o);
  }

  // A zone: its own painted landscape at the top, whatever the job there has to say and
  // the flavour under that, and the two rows of icons stood on the foot of the panel.
  location(entry, y) {
    // The two rows are laid out first, because where they end up is where the prose above
    // them has to stop. They are stood on the foot of the panel, so their own height is
    // what decides that.
    const rows = [['Environment', entry.environment], ['Resources', entry.resources]]
      .filter(([, list]) => list && list.length)
      .map(([name, list]) => this.factRow(name, list));
    const tall = rows.reduce((n, r) => n + r.lines * TUNING.menuFactRow, 0);
    const footer = this.box.y + this.box.h - TUNING.menuPad - 26 - tall;

    // To the width of the page and no further, and no taller than its share of it: the
    // painting is wider than it is tall, and squashing it to a box would stop it being a
    // landscape. Centred, because what is left over is a margin and not a gap. The frame
    // it is set in takes its own edge off both, so the picture keeps its shape inside it.
    const edge = TUNING.menuPortraitEdge;
    const place = this.add.image(0, 0, entry.backdrop.image).setOrigin(0, 0);
    place.setScale(Math.min(1,
      (this.detailW - edge * 2) / place.width,
      (TUNING.menuPortraitHeight - edge * 2) / place.height));
    const w = place.displayWidth;
    const h = place.displayHeight;
    const x = this.detailX + (this.detailW - w) / 2;
    // the square off the town's own sheet, the one a speaker's face is set in — hung
    // first, so the painting sits inside its rails rather than over them
    this.hang(PLATE, { x: x - edge, y, w: w + edge * 2, h: h + edge * 2 });
    place.setPosition(x, y + edge);
    this.layer.add(place);
    y += h + edge * 2 + 14;

    // What the place is, and then one line on whether the party can go there — the job
    // itself is written out on the Quests tab, and this page is the place rather than the
    // work. A job that cannot be walked says the first thing standing in the way.
    const state = entry.quest
      ? (canStart(entry.quest) ? ['Ready. [Enter] to set out.'] : blockers(entry.quest).slice(0, 2))
      : [];
    for (const line of [...entry.body, ...state]) {
      if (y > footer - 20) break; // the rows below own the rest of the page
      y += this.text(this.detailX, y, fill(line), TUNING.menuBodySize, COLORS.menuText, this.detailW).height + 8;
    }

    let ry = footer;
    for (const row of rows) ry = this.drawFactRow(row, ry);
  }

  // What one of those rows is made of, measured before anything is drawn: the label, and
  // every thing on it with its icon and its word, wrapped to the width of the page.
  factRow(name, list) {
    const scratch = this.add.text(0, 0, '', { fontFamily: TUNING.font, fontSize: `${TUNING.menuHintSize}px` });
    const label = `${name}:`;
    scratch.setFontSize(TUNING.menuBodySize);
    scratch.setText(label);
    const indent = scratch.width + 12;
    scratch.setFontSize(TUNING.menuHintSize);
    const items = list.map((thing) => {
      scratch.setText(thing);
      return { thing, w: TUNING.menuFactIcon + 6 + scratch.width + 16 };
    });
    scratch.destroy();

    // how many lines it takes, wrapping under the label rather than under the icons
    let lines = 1;
    let x = indent;
    for (const it of items) {
      if (x + it.w > this.detailW && x > indent) { lines += 1; x = indent; }
      x += it.w;
    }
    return { label, indent, items, lines };
  }

  drawFactRow(row, top) {
    this.text(this.detailX, top + 6, row.label, TUNING.menuBodySize, COLORS.menuDim);
    let x = this.detailX + row.indent;
    let y = top;
    for (const it of row.items) {
      if (x + it.w > this.detailX + this.detailW && x > this.detailX + row.indent) {
        y += TUNING.menuFactRow;
        x = this.detailX + row.indent;
      }
      const icon = this.add.image(x, y + TUNING.menuFactRow / 2, iconKeyFor(it.thing)).setOrigin(0, 0.5);
      icon.setDisplaySize(TUNING.menuFactIcon, TUNING.menuFactIcon);
      this.layer.add(icon);
      // the word beside its icon: most of these are a blank square until there is art for
      // them, and a row of blank squares says nothing on its own
      this.text(x + TUNING.menuFactIcon + 6, y + 8, it.thing, TUNING.menuHintSize, COLORS.menuText);
      x += it.w;
    }
    return y + TUNING.menuFactRow;
  }

  // A panel has nothing to draw a grid of: it is one line, and the map of it is that line
  // with everything on it marked by how far along it stands. Pins come from the live world
  // rather than from content/places.js: move an NPC or a door and the map follows on its
  // own.
  miniMap(entry, y) {
    const map = MAPS[entry.map];
    const tiles = (map.street.size[0] * map.street.repeats) / TUNING.tileSize;
    const cell = this.detailW / tiles;
    const h = 16;
    const x0 = this.detailX;

    const g = this.add.graphics();
    g.fillStyle(COLORS.path[0], 1);
    g.fillRect(x0, y, this.detailW, h);
    g.lineStyle(1, this.ink(COLORS.menuRule), 1);
    g.strokeRect(x0 - 1, y - 1, this.detailW + 2, h + 2);

    const pin = (tx, color) => {
      g.fillStyle(this.ink(color), 1);
      g.fillRect(Math.round(x0 + tx * cell) - 1, y, 3, h);
    };

    const pins = setting('pins');
    if (pins !== 'none') {
      for (const d of map.doors) pin(d.x, COLORS.menuMapDoor);
      for (const b of buildings()) if (b.map === entry.map) pin(b.site[0], COLORS.menuMapDoor);
    }
    if (pins === 'all') for (const n of NPCS) if (n.map === entry.map) pin(n.x, COLORS.menuMapFolk);
    if (entry.at) pin(entry.at[0], COLORS.menuMapMark);

    const world = this.scene.get('World');
    if (world.mapKey === entry.map) pin(world.player.x / TUNING.tileSize, COLORS.menuMapYou);
    this.layer.add(g);

    return y + h + 8 + this.key(x0, y + h + 8, entry).height;
  }

  key(x, y, entry) {
    const pins = setting('pins');
    const swatches = [[COLORS.menuMapYou, 'you']];
    if (pins !== 'none') swatches.push([COLORS.menuMapDoor, 'door']);
    if (pins === 'all') swatches.push([COLORS.menuMapFolk, 'folk']);
    if (entry.at) swatches.push([COLORS.menuMapMark, 'here']);

    const g = this.add.graphics();
    this.layer.add(g);
    let last = null;
    for (const [color, name] of swatches) {
      g.fillStyle(this.ink(color), 1);
      g.fillRect(x, y + 3, 7, 7);
      last = this.text(x + 12, y, name, TUNING.menuHintSize, COLORS.menuDim);
      x += 12 + last.width + 16;
    }
    return last;
  }

  hint() {
    const rows = this.rows();
    let change = rows.some((r) => r.options) ? '    [Enter] Change' : '';
    if (rows.some((r) => r.quest)) change = '    [Enter] Set out';
    if (rows.some((r) => r.skill)) change = pointsOf(YOU) ? '    [Enter] Spend a point' : '';
    // said only while the cursor is on a bottle, because it is the only square that answers
    const here = rows[this.row[this.tab]];
    if (here && here.mid && potions.canDrink(here.mid)) change = '    [Enter] Drink it';
    this.text(
      this.listX,
      this.box.y + this.box.h - 26,
      `[<-/->] Tab    [Up/Down] Select${change}    [M] or [Esc] Close`,
      TUNING.menuHintSize,
      COLORS.menuDim,
    );
  }

  // Everything written here is written on paper, so a colour picked for a dark board is
  // swapped for its ink on the way to the page. Nothing that builds a line has to know.
  ink(color) {
    return inkOf(PANEL, color);
  }

  text(x, y, str, size, color, wrap) {
    const t = this.add.text(x, y, str, {
      fontFamily: TUNING.font,
      fontSize: `${size}px`,
      color: hex(this.ink(color)),
      lineSpacing: 4,
      ...(wrap ? { wordWrap: { width: wrap } } : {}),
    });
    this.layer.add(t);
    return t;
  }
}
